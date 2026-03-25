import { describe, expect, it, vi } from 'vitest'

import { unlockNodeWithRetry } from '../nodeUnlock'

describe('unlockNodeWithRetry', () => {
  it('treats prefixed already-unlocked API errors as success', async () => {
    const unlock = vi.fn().mockRejectedValue({
      status: 500,
      data: { error: 'API Error (500): Node has already been unlocked' },
    })
    const getNodeInfo = vi.fn().mockResolvedValue({ isSuccess: true })

    const outcome = await unlockNodeWithRetry({
      getNodeInfo,
      invalidPasswordMessage: 'Invalid password',
      maxRetriesMessage: 'Too many retries',
      unlock,
      unlockTimeoutMessage: 'Unlock taking too long',
      verifyFailureMessage: 'Failed to verify node status after unlock',
    })

    expect(outcome).toBe('already-unlocked')
    expect(unlock).toHaveBeenCalledTimes(1)
    expect(getNodeInfo).toHaveBeenCalledTimes(1)
  })
})
