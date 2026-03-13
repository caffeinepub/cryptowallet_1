import Array "mo:core/Array";
import Float "mo:core/Float";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userWallets = Map.empty<Principal, UserWallet>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  module Transaction {
    public func compare(tx1 : Transaction, tx2 : Transaction) : Order.Order {
      Int.compare(tx1.timestamp, tx2.timestamp);
    };
  };

  public type Asset = {
    #BTC;
    #ETH;
    #ICP;
    #USDT;
  };

  public type Direction = {
    #send;
    #receive;
  };

  public type Transaction = {
    id : Nat;
    asset : Asset;
    amount : Float;
    direction : Direction;
    counterparty : Text;
    timestamp : Time.Time;
    note : Text;
  };

  public type UserWallet = {
    displayName : Text;
    balances : [(Asset, Float)];
    transactions : [Transaction];
    nextTxId : Nat;
  };

  public type AssetBalance = {
    asset : Asset;
    balance : Float;
  };

  public type UserProfile = {
    name : Text;
  };

  let defaultBalances : [(Asset, Float)] = [
    (#BTC, 0.0),
    (#ETH, 0.0),
    (#ICP, 0.0),
    (#USDT, 0.0),
  ];

  func getUserWalletOrTrap(user : Principal) : UserWallet {
    switch (userWallets.get(user)) {
      case (null) { Runtime.trap("Wallet does not exist") };
      case (?wallet) { wallet };
    };
  };

  func validateAmount(amount : Float) {
    if (amount <= 0.0) {
      Runtime.trap("Amount must be positive");
    };
  };

  func findBalance(asset : Asset, balances : [(Asset, Float)]) : Float {
    switch (balances.find(func((a, _)) { a == asset })) {
      case (null) { 0.0 };
      case (?(_, balance)) { balance };
    };
  };

  func updateAssetBalance(balances : [(Asset, Float)], asset : Asset, amount : Float) : [(Asset, Float)] {
    let oldBalance = findBalance(asset, balances);
    if (oldBalance + amount < 0.0) { Runtime.trap("Insufficient funds") };

    let filtered = balances.filter(func((a, _)) { a != asset });
    filtered.concat([(asset, oldBalance + amount)]);
  };

  // User Profile Functions (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Wallet Functions
  public shared ({ caller }) func initializeWallet() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can initialize wallets");
    };
    if (userWallets.containsKey(caller)) {
      Runtime.trap("Wallet already exists");
    };
    let wallet : UserWallet = {
      displayName = "Anonymous";
      balances = defaultBalances;
      transactions = [];
      nextTxId = 1;
    };
    userWallets.add(caller, wallet);
  };

  public shared ({ caller }) func setDisplayName(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set display name");
    };
    let wallet = getUserWalletOrTrap(caller);
    let newWallet : UserWallet = {
      wallet with displayName = name;
    };
    userWallets.add(caller, newWallet);
  };

  public query ({ caller }) func getDisplayName() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view display name");
    };
    let wallet = getUserWalletOrTrap(caller);
    wallet.displayName;
  };

  public query ({ caller }) func getBalances() : async [AssetBalance] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view balances");
    };
    let wallet = getUserWalletOrTrap(caller);
    wallet.balances.map(func((asset, balance)) { { asset; balance } });
  };

  public shared ({ caller }) func addMockBalance(asset : Asset, amount : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add mock balance");
    };
    validateAmount(amount);
    let wallet = getUserWalletOrTrap(caller);
    let newBalances = updateAssetBalance(wallet.balances, asset, amount);
    userWallets.add(
      caller,
      {
        wallet with
        balances = newBalances
      },
    );
  };

  public shared ({ caller }) func sendAsset(asset : Asset, amount : Float, counterparty : Text, note : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send assets");
    };
    validateAmount(amount);
    let wallet = getUserWalletOrTrap(caller);

    let updatedBalances = updateAssetBalance(wallet.balances, asset, -amount);

    let transaction : Transaction = {
      id = wallet.nextTxId;
      asset;
      amount;
      direction = #send;
      counterparty;
      timestamp = Time.now();
      note;
    };

    let transactionsList = List.fromArray<Transaction>(wallet.transactions);
    transactionsList.add(transaction);
    let transactions = transactionsList.toArray();

    let newWallet : UserWallet = {
      wallet with
      balances = updatedBalances;
      transactions;
      nextTxId = wallet.nextTxId + 1;
    };
    userWallets.add(caller, newWallet);
  };

  public shared ({ caller }) func receiveAsset(asset : Asset, amount : Float, counterparty : Text, note : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can receive assets");
    };
    validateAmount(amount);
    let wallet = getUserWalletOrTrap(caller);

    let updatedBalances = updateAssetBalance(wallet.balances, asset, amount);

    let transaction : Transaction = {
      id = wallet.nextTxId;
      asset;
      amount;
      direction = #receive;
      counterparty;
      timestamp = Time.now();
      note;
    };

    let transactionsList = List.fromArray<Transaction>(wallet.transactions);
    transactionsList.add(transaction);
    let transactions = transactionsList.toArray();

    let newWallet : UserWallet = {
      wallet with
      balances = updatedBalances;
      transactions;
      nextTxId = wallet.nextTxId + 1;
    };
    userWallets.add(caller, newWallet);
  };

  public query ({ caller }) func getTransactionHistory() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transaction history");
    };
    let wallet = getUserWalletOrTrap(caller);
    wallet.transactions.sort();
  };
};
