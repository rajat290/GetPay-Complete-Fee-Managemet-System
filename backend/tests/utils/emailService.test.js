const emailService = require('../../utils/emailService');

describe('Email Service', () => {
  describe('sendEmail', () => {
    it('should be defined', () => {
      expect(emailService.sendEmail).toBeDefined();
    });

    it('should return a promise', () => {
      const result = emailService.sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        text: 'Test email'
      });
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('sendPaymentReceipt', () => {
    it('should be defined', () => {
      expect(emailService.sendPaymentReceipt).toBeDefined();
    });
  });

  describe('sendFeeReminder', () => {
    it('should be defined', () => {
      expect(emailService.sendFeeReminder).toBeDefined();
    });
  });
});
