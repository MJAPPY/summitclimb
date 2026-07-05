import ProtonSDK, { LinkSession } from '@proton/web-sdk';

class ProtonConnectionManager {
  private session: LinkSession | null = null;
  private appName = 'GUYS Summit';
  private appLogo = 'https://raw.githubusercontent.com/protonprotocol/proton-web-sdk/master/assets/logo.png';
  private endpoints = ['https://proton.greymass.com', 'https://proton.api.cosmos.eoscanada.com'];

  // Query actual multi-token balances on-chain via EOSIO/Proton chain RPC
  async getBalances(actor: string): Promise<{ XPR: number; GUY: number }> {
    const results = { XPR: 0, GUY: 0 };
    const endpoint = this.endpoints[0]; // Primary Greymass Mainnet RPC
    
    // Fetch XPR balance
    try {
      const resXPR = await fetch(`${endpoint}/v1/chain/get_currency_balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'eosio.token',
          account: actor,
          symbol: 'XPR'
        })
      });
      if (resXPR.ok) {
        const balances = await resXPR.json();
        if (Array.isArray(balances) && balances.length > 0) {
          results.XPR = parseFloat(balances[0].split(' ')[0]) || 0;
        }
      }
    } catch (e) {
      console.warn('Error fetching XPR balance:', e);
    }

    // Fetch GUY balance
    try {
      const resGUY = await fetch(`${endpoint}/v1/chain/get_currency_balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'vtoken',
          account: actor,
          symbol: 'GUY'
        })
      });
      if (resGUY.ok) {
        const balances = await resGUY.json();
        if (Array.isArray(balances) && balances.length > 0) {
          results.GUY = parseFloat(balances[0].split(' ')[0]) || 0;
        }
      }
    } catch (e) {
      console.warn('Error fetching GUY balance:', e);
    }

    return results;
  }

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
  async transfer(to: string, amount: number, token: 'XPR' | 'USDT' | 'CLIMB' | 'GUY', memo: string) {
    if (!this.session) {
      throw new Error('No active wallet session to sign transaction.');
    }

    const precision = token === 'USDT' ? 6 : 4;
    const formattedQuantity = `${amount.toFixed(precision)} ${token}`;
    
    // Assign appropriate smart contracts dynamically
    const contract = token === 'USDT' ? 'xtokens' : token === 'GUY' ? 'vtoken' : 'eosio.token';

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