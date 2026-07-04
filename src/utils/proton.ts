import ProtonSDK, { LinkSession } from '@proton/web-sdk';

class ProtonConnectionManager {
  private session: LinkSession | null = null;
  private appName = 'GUYS Summit';
  private appLogo = 'https://raw.githubusercontent.com/protonprotocol/proton-web-sdk/master/assets/logo.png';
  private endpoints = ['https://proton.greymass.com', 'https://proton.api.cosmos.eoscanada.com'];

  // Establish a real mainnet connection via the Proton Selector overlay
  async connect(): Promise<{ actor: string; session: LinkSession }> {
    try {
      const { session } = await ProtonSDK({
        linkOptions: {
          endpoints: this.endpoints
        },
        transportOptions: {
          requestAccount: 'tripseven',
        } as any,
        selectorOptions: {
          appName: this.appName,
          appLogo: this.appLogo
        } as any
      });

      this.session = session;
      return {
        actor: session.auth.actor.toString(),
        session
      };
    } catch (error) {
      console.error('Proton login error:', error);
      throw error;
    }
  }

  // Check for pre-existing verified sessions to bypass scanner dialog on reload
  async restore(): Promise<{ actor: string; session: LinkSession } | null> {
    try {
      const { session } = await ProtonSDK({
        linkOptions: {
          endpoints: this.endpoints
        },
        transportOptions: {} as any,
        selectorOptions: {
          appName: this.appName,
          appLogo: this.appLogo
        } as any
      });

      if (session) {
        this.session = session;
        return {
          actor: session.auth.actor.toString(),
          session
        };
      }
      return null;
    } catch (error) {
      console.warn('Could not restore Proton session:', error);
      return null;
    }
  }

  // Clear current session credentials
  async disconnect() {
    if (this.session) {
      try {
        await (this.session.link as any).removeSession(this.session.auth);
      } catch (e) {
        console.warn('Session removal warning:', e);
      }
      this.session = null;
    }
  }

  // Push a real on-chain transfer transaction request to the user's WebAuth.com wallet
  async transfer(to: string, amount: number, token: 'XPR' | 'USDT' | 'CLIMB', memo: string) {
    if (!this.session) {
      throw new Error('No active wallet session to sign transaction.');
    }

    const precision = token === 'USDT' ? 6 : 4;
    const formattedQuantity = `${amount.toFixed(precision)} ${token}`;
    const contract = token === 'USDT' ? 'xtokens' : 'eosio.token';

    const action = {
      account: contract,
      name: 'transfer',
      authorization: [this.session.auth],
      data: {
        from: this.session.auth.actor.toString(),
        to,
        quantity: formattedQuantity,
        memo
      }
    };

    return await this.session.transact({
      actions: [action]
    }, {
      broadcast: true
    });
  }
}

export const protonService = new ProtonConnectionManager();