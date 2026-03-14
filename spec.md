# TRUPTARWallet

## Current State
The app has Home, About TSLA Coin, Investments, Wallet Dashboard, and Admin pages. The Admin page exists but lacks payment/request confirmation workflow. There is no Contact page.

## Requested Changes (Diff)

### Add
- Contact page with phone (+14026270793), email (patrickjuventus82@gmail.com), and Omaha Nebraska address
- Admin page payment confirmation and request management tabs (approve/reject deposits and withdrawals, view pending requests)

### Modify
- NavBar: add "contact" to AppPage type and nav links
- App.tsx: add contact page route
- AdminPage: add Payments and Requests tabs with confirm/reject actions and user registration list

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/pages/ContactPage.tsx` with phone, email, address info
2. Update `AppPage` type in NavBar.tsx to include `"contact"`
3. Update NavBar links to include Contact
4. Update App.tsx to route to ContactPage
5. Enhance AdminPage with: registered users list, pending payment confirmations, pending withdrawal requests -- all with approve/reject actions
