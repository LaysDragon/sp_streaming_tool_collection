import * as Phaser from 'phaser';
import { CollisionCategory } from '../collision_category';
import { EventSubWsListener } from '@twurple/eventsub-ws';
import { ApiClient } from '@twurple/api';
import { AuthProvider, StaticAuthProvider } from '@twurple/auth';
import { MockAuthProvider } from '../twitch/mock_auth_provider';
import { ChatClient, ChatMessage } from '@twurple/chat';
export default class Demo extends Phaser.Scene {

  constructor() {
    super('GameScene');
  }

  preload() {
    

    
  }

  getConfig(): Config {
    let params = (new URL(location.href)).searchParams;
    return {
      twitch: params.get('twitch') as "none" | "point" | "chat" ?? 'chat',
      mock: params.get('mock') === 'true' ?? false,
      clientId: params.get('clientId'),
      accessToken: params.get('accessToken'),
      userId: params.get('userId'),
      channel: params.get('channel'),
    }
  }

  initTwitch(config: Config) {
    if (config.twitch === 'point') {

      if (config.clientId == null || config.accessToken == null || config.userId == null) {
        let errorText = this.add.text(150, 500, 'Twitch Point Mode 初始化失敗，缺少 clientId 或 accessToken 或 userId',
          {
            fontSize: '20px',
            align: 'center',
            color: '#ff0000'
          },).setPadding(2);
        return false;
      }

      let authProvider: AuthProvider;
      if (config.mock) {
        authProvider = new MockAuthProvider(config.clientId!, config.accessToken!, config.userId);
      } else {
        authProvider = new StaticAuthProvider(config.clientId!, config.accessToken!);
      }

      const listener = new EventSubWsListener({
        apiClient: new ApiClient({
          authProvider: authProvider,
          mockServerPort: config.mock ? 8080 : undefined,
        }),
      });

      listener.onChannelRedemptionAddForReward(config.userId, 'reward_id', (data) => {
        //TODO: reward action
      });

      listener.start();
    }

    if (config.twitch === 'chat') {
      if (config.channel == null) {
        let errorText = this.add.text(150, 500, 'Twitch Chat Mode 初始化失敗，缺少 channel 參數',
          {
            fontSize: '20px',
            align: 'center',
            color: '#ff0000'
          },).setPadding(2);
        return false;
      }

      const chatClient = new ChatClient({ channels: [config.channel] });
      chatClient.connect();
      const keywords:string[] = [
        
      ];
      const commandRegex = new RegExp(`!(${keywords.join('|')})`);
      chatClient.onMessage(async (channel: string, user: string, text: string, msg: ChatMessage) => {
        if (commandRegex.test(msg.text)) {
          //TODO: message action
        }
      });
    }
    return true;

  }


  create() {
    let config = this.getConfig();
    if (config.twitch !== 'none') {
      if (!this.initTwitch(config)) {
        return;
      }
    }

  }

  update(time: number, delta: number): void {
  }
}




interface Config {
  twitch: 'point' | 'chat' | 'none';
  mock: boolean;
  clientId: string | null;
  accessToken: string | null;
  userId: string | null;
  channel: string | null;
}