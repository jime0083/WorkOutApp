/**
 * Firestore Security Rules テスト
 *
 * テスト実行前に Firebase Emulator を起動してください:
 * firebase emulators:start --only firestore
 */
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as path from 'path';

let testEnv: RulesTestEnvironment;

// テスト用のユーザーID
const USER_A = 'userA';
const USER_B = 'userB';
const USER_C = 'userC';

beforeAll(async () => {
  // Security Rules を読み込み
  const rulesPath = path.resolve(__dirname, '../../../firestore.rules');
  const rules = fs.readFileSync(rulesPath, 'utf8');

  testEnv = await initializeTestEnvironment({
    projectId: 'workoutapp-test',
    firestore: {
      rules,
      host: 'localhost',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe('Firestore Security Rules', () => {
  describe('users コレクション', () => {
    it('認証済みユーザーは他ユーザーの情報を読み取れる', async () => {
      // セットアップ: ユーザーを作成
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('users').doc(USER_B).set({
          visibleUserId: 'userB123',
          nickname: 'User B',
          createdAt: new Date(),
        });
      });

      const db = testEnv.authenticatedContext(USER_A).firestore();
      await assertSucceeds(db.collection('users').doc(USER_B).get());
    });

    it('未認証ユーザーはユーザー情報を読み取れない', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('users').doc(USER_A).set({
          visibleUserId: 'userA123',
          nickname: 'User A',
        });
      });

      const db = testEnv.unauthenticatedContext().firestore();
      await assertFails(db.collection('users').doc(USER_A).get());
    });

    it('ユーザーは自分のプロフィールを更新できる', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('users').doc(USER_A).set({
          visibleUserId: 'userA123',
          nickname: 'User A',
          createdAt: new Date(),
        });
      });

      const db = testEnv.authenticatedContext(USER_A).firestore();
      await assertSucceeds(
        db.collection('users').doc(USER_A).update({
          nickname: 'New Nickname',
          updatedAt: new Date(),
        })
      );
    });

    it('ユーザーは他人のプロフィールを更新できない', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('users').doc(USER_B).set({
          visibleUserId: 'userB123',
          nickname: 'User B',
        });
      });

      const db = testEnv.authenticatedContext(USER_A).firestore();
      await assertFails(
        db.collection('users').doc(USER_B).update({
          nickname: 'Hacked Name',
        })
      );
    });

    it('クライアントからユーザーを作成できない', async () => {
      const db = testEnv.authenticatedContext(USER_A).firestore();
      await assertFails(
        db.collection('users').doc(USER_A).set({
          visibleUserId: 'newUser',
          nickname: 'New User',
        })
      );
    });

    it('ユーザーはアカウントを削除できない（Cloud Functions経由のみ）', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('users').doc(USER_A).set({
          visibleUserId: 'userA123',
        });
      });

      const db = testEnv.authenticatedContext(USER_A).firestore();
      await assertFails(db.collection('users').doc(USER_A).delete());
    });
  });

  describe('conversations コレクション', () => {
    const conversationId = 'conv1';

    it('参加者は会話を読み取れる', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('conversations').doc(conversationId).set({
          participantIds: [USER_A, USER_B],
          createdAt: new Date(),
        });
      });

      const db = testEnv.authenticatedContext(USER_A).firestore();
      await assertSucceeds(db.collection('conversations').doc(conversationId).get());
    });

    it('非参加者は会話を読み取れない', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('conversations').doc(conversationId).set({
          participantIds: [USER_A, USER_B],
        });
      });

      const db = testEnv.authenticatedContext(USER_C).firestore();
      await assertFails(db.collection('conversations').doc(conversationId).get());
    });

    it('認証済みユーザーは自分を含む会話を作成できる', async () => {
      const db = testEnv.authenticatedContext(USER_A).firestore();
      await assertSucceeds(
        db.collection('conversations').doc(conversationId).set({
          participantIds: [USER_A, USER_B],
          createdAt: new Date(),
        })
      );
    });

    it('自分を含まない会話は作成できない', async () => {
      const db = testEnv.authenticatedContext(USER_A).firestore();
      await assertFails(
        db.collection('conversations').doc(conversationId).set({
          participantIds: [USER_B, USER_C],
          createdAt: new Date(),
        })
      );
    });

    it('3人以上の会話は作成できない', async () => {
      const db = testEnv.authenticatedContext(USER_A).firestore();
      await assertFails(
        db.collection('conversations').doc(conversationId).set({
          participantIds: [USER_A, USER_B, USER_C],
          createdAt: new Date(),
        })
      );
    });
  });

  describe('messages サブコレクション', () => {
    const conversationId = 'conv1';
    const messageId = 'msg1';

    beforeEach(async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('conversations').doc(conversationId).set({
          participantIds: [USER_A, USER_B],
        });
      });
    });

    it('参加者はメッセージを読み取れる', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context
          .firestore()
          .collection('conversations')
          .doc(conversationId)
          .collection('messages')
          .doc(messageId)
          .set({
            senderId: USER_A,
            content: 'Hello',
            createdAt: new Date(),
          });
      });

      const db = testEnv.authenticatedContext(USER_B).firestore();
      await assertSucceeds(
        db
          .collection('conversations')
          .doc(conversationId)
          .collection('messages')
          .doc(messageId)
          .get()
      );
    });

    it('参加者は自分を送信者としてメッセージを作成できる', async () => {
      const db = testEnv.authenticatedContext(USER_A).firestore();
      await assertSucceeds(
        db
          .collection('conversations')
          .doc(conversationId)
          .collection('messages')
          .doc(messageId)
          .set({
            senderId: USER_A,
            content: 'Hello',
            createdAt: new Date(),
          })
      );
    });

    it('他人を送信者としてメッセージを作成できない', async () => {
      const db = testEnv.authenticatedContext(USER_A).firestore();
      await assertFails(
        db
          .collection('conversations')
          .doc(conversationId)
          .collection('messages')
          .doc(messageId)
          .set({
            senderId: USER_B, // 偽装
            content: 'Spoofed message',
            createdAt: new Date(),
          })
      );
    });

    it('非参加者はメッセージを作成できない', async () => {
      const db = testEnv.authenticatedContext(USER_C).firestore();
      await assertFails(
        db
          .collection('conversations')
          .doc(conversationId)
          .collection('messages')
          .doc(messageId)
          .set({
            senderId: USER_C,
            content: 'Unauthorized message',
            createdAt: new Date(),
          })
      );
    });
  });

  describe('friendships コレクション', () => {
    const friendshipId = 'friendship1';

    it('当事者は友達関係を読み取れる', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('friendships').doc(friendshipId).set({
          requesterId: USER_A,
          receiverId: USER_B,
          memberIds: [USER_A, USER_B],
          status: 'pending',
        });
      });

      const db = testEnv.authenticatedContext(USER_A).firestore();
      await assertSucceeds(db.collection('friendships').doc(friendshipId).get());
    });

    it('第三者は友達関係を読み取れない', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('friendships').doc(friendshipId).set({
          requesterId: USER_A,
          receiverId: USER_B,
          memberIds: [USER_A, USER_B],
          status: 'accepted',
        });
      });

      const db = testEnv.authenticatedContext(USER_C).firestore();
      await assertFails(db.collection('friendships').doc(friendshipId).get());
    });

    it('ユーザーは友達申請を作成できる', async () => {
      const db = testEnv.authenticatedContext(USER_A).firestore();
      await assertSucceeds(
        db.collection('friendships').doc(friendshipId).set({
          requesterId: USER_A,
          receiverId: USER_B,
          memberIds: [USER_A, USER_B],
          status: 'pending',
          createdAt: new Date(),
        })
      );
    });

    it('他人名義で友達申請を作成できない', async () => {
      const db = testEnv.authenticatedContext(USER_A).firestore();
      await assertFails(
        db.collection('friendships').doc(friendshipId).set({
          requesterId: USER_B, // 偽装
          receiverId: USER_C,
          memberIds: [USER_B, USER_C],
          status: 'pending',
        })
      );
    });

    it('当事者は友達関係を削除できる（友達解除）', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('friendships').doc(friendshipId).set({
          requesterId: USER_A,
          receiverId: USER_B,
          memberIds: [USER_A, USER_B],
          status: 'accepted',
        });
      });

      const db = testEnv.authenticatedContext(USER_A).firestore();
      await assertSucceeds(db.collection('friendships').doc(friendshipId).delete());
    });
  });

  describe('subscriptions コレクション', () => {
    it('ユーザーは自分のサブスクリプションを読み取れる', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('subscriptions').doc(USER_A).set({
          planType: 'monthly',
          status: 'active',
        });
      });

      const db = testEnv.authenticatedContext(USER_A).firestore();
      await assertSucceeds(db.collection('subscriptions').doc(USER_A).get());
    });

    it('ユーザーは他人のサブスクリプションを読み取れない', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('subscriptions').doc(USER_B).set({
          planType: 'yearly',
          status: 'active',
        });
      });

      const db = testEnv.authenticatedContext(USER_A).firestore();
      await assertFails(db.collection('subscriptions').doc(USER_B).get());
    });

    it('クライアントからサブスクリプションを作成できない', async () => {
      const db = testEnv.authenticatedContext(USER_A).firestore();
      await assertFails(
        db.collection('subscriptions').doc(USER_A).set({
          planType: 'monthly',
          status: 'active',
        })
      );
    });

    it('クライアントからサブスクリプションを更新できない', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('subscriptions').doc(USER_A).set({
          planType: 'monthly',
          status: 'active',
        });
      });

      const db = testEnv.authenticatedContext(USER_A).firestore();
      await assertFails(
        db.collection('subscriptions').doc(USER_A).update({
          planType: 'yearly', // 不正な変更
        })
      );
    });
  });
});
