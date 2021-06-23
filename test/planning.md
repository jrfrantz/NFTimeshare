What to test

Deployment
- NFTimeshare linkages get set up successfully
- No one else can change those addresses

Deposits
- NFT gets split up to depositor
- Wrapped NFTs can't be transferred, approved, etc
- Asset URIs work as expected
- Can't deposit an already-deposited NFT
- Non-owners can deposit if approved, or approved-for-all

Months
- can all be traded freely
- getOwner methods work correctly
- getOwner methods loop back around december correctly

Redemption:
- correctly restores NFT ownership
- can't be redeemed twice
- Month tokens vanish

Redemption permissions
- also works when redeemer is approved-but-not-owner, too
- doesn't work by someone who owns 11-of-12, or 0-of-12

Incompatible tokens or contracts??
- won't accept random ERC20s
