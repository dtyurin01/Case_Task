const mockFindUnique = jest.fn();
const mockCreate     = jest.fn();
const mockUpdate     = jest.fn();
const mockDelete     = jest.fn();
const mockFindMany   = jest.fn();
const mockDisconnect = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    subscription: {
      findUnique: mockFindUnique,
      create:     mockCreate,
      update:     mockUpdate,
      delete:     mockDelete,
      findMany:   mockFindMany,
    },
    $disconnect: mockDisconnect,
  })),
  Frequency: {
    hourly: 'hourly',
    daily:  'daily',
  },
}));

const {
  subscribeUser,
  confirmSubscription,
  unsubscribeUser,
  getSubscriptionByEmail,
  getSubscriptionByToken,
  getAllSubscriptions,
  disconnectPrisma,
} = require('../src/services/subscriptionService');

jest.mock('uuid', () => ({ v4: jest.fn().mockReturnValue('uuid-token') }));

describe('subscriptionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('subscribeUser', () => {
    it('creates a new subscription if none exists', async () => {
      mockFindUnique.mockResolvedValue(null);
      const fakeSub = {
        id: '1',
        email: 'a@b.com',
        city: 'City',
        frequency: 'hourly',
        confirmToken: 'uuid-token',
        unsubscribeToken: 'uuid-token',
      };
      mockCreate.mockResolvedValue(fakeSub);

      const result = await subscribeUser('a@b.com', 'City', 'hourly');

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { email: 'a@b.com' },
      });
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          email: 'a@b.com',
          city: 'City',
          frequency: 'hourly',
          confirmed: false,
          confirmToken: 'uuid-token',
          unsubscribeToken: 'uuid-token',
        },
      });
      expect(result).toBe(fakeSub);
    });

    it('throws if email already subscribed', async () => {
      mockFindUnique.mockResolvedValue({ id: '1' });
      await expect(
        subscribeUser('a@b.com', 'City', 'daily')
      ).rejects.toThrow('Email already subscribed');
    });
  });

  describe('confirmSubscription', () => {
    it('confirms an unconfirmed subscription', async () => {
      const existing = { id: '1', confirmed: false };
      mockFindUnique.mockResolvedValue(existing);
      const updated = { ...existing, confirmed: true };
      mockUpdate.mockResolvedValue(updated);

      const result = await confirmSubscription('token');

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { confirmToken: 'token' },
      });
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { confirmed: true },
      });
      expect(result).toBe(updated);
    });

    it('throws if token not found', async () => {
      mockFindUnique.mockResolvedValue(null);
      await expect(confirmSubscription('bad')).rejects.toThrow(
        'Token not found'
      );
    });

    it('throws if already confirmed', async () => {
      mockFindUnique.mockResolvedValue({ id: '1', confirmed: true });
      await expect(confirmSubscription('tok')).rejects.toThrow(
        'Already confirmed'
      );
    });
  });

  describe('unsubscribeUser', () => {
    it('deletes subscription when token valid', async () => {
      const sub = { id: '2', unsubscribeToken: 't2' };
      mockFindUnique.mockResolvedValue(sub);
      mockDelete.mockResolvedValue(undefined);

      await expect(unsubscribeUser('t2')).resolves.toBeUndefined();
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { unsubscribeToken: 't2' },
      });
      expect(mockDelete).toHaveBeenCalledWith({ where: { id: '2' } });
    });

    it('throws if token invalid', async () => {
      mockFindUnique.mockResolvedValue(null);
      await expect(unsubscribeUser('bad')).rejects.toThrow(
        'Invalid or expired unsubscribe token'
      );
    });
  });

  describe('getSubscriptionByEmail', () => {
    it('returns subscription', async () => {
      const sub = { id: '3' };
      mockFindUnique.mockResolvedValue(sub);
      await expect(getSubscriptionByEmail('x@y.com')).resolves.toBe(sub);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { email: 'x@y.com' },
      });
    });
  });

  describe('getSubscriptionByToken', () => {
    it('returns subscription', async () => {
      const sub = { id: '4' };
      mockFindUnique.mockResolvedValue(sub);
      await expect(getSubscriptionByToken('tok')).resolves.toBe(sub);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { unsubscribeToken: 'tok' },
      });
    });
  });

  describe('getAllSubscriptions', () => {
    it('returns array of subscriptions', async () => {
      const list = [{ id: '1' }, { id: '2' }];
      mockFindMany.mockResolvedValue(list);
      await expect(getAllSubscriptions()).resolves.toBe(list);
      expect(mockFindMany).toHaveBeenCalled();
    });
  });

  describe('disconnectPrisma', () => {
    it('calls $disconnect', async () => {
      await disconnectPrisma();
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });
});
