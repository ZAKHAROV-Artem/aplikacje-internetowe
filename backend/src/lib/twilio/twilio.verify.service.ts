class TwilioVerifyService {
  private _client: any;

  constructor() {
    this._client = null;
  }

  get client() {
    if (!this._client) {
      this._client = require("twilio")(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    }
    return this._client;
  }

  async sendCode({
    to,
    channel = "sms",
  }: {
    to: string;
    channel?: "sms" | "call";
  }) {
    const verification = await this.client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to, channel });
    return verification;
  }

  async checkCode({ to, code }: { to: string; code: string }) {
    const verificationCheck = await this.client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to, code });
    return verificationCheck;
  }
}

const twilioVerifyService = new TwilioVerifyService();

export { twilioVerifyService };
