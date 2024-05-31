/// Module: gifter_contracts

module gifter_contracts::gifter {
    use std::string::String;
    use sui::coin::{Self, Coin};
    use sui::sui::{Self, SUI};
    use sui::balance::{Self, Balance};
   // use sui::package::{Self, Publisher};
    use sui::random::{Self, Random};
    use sui::dynamic_object_field as ofield;
    use sui::event;




  //---------------------------------------------------------------------------
  // Object structs;
  //---------------------------------------------------------------------------


 /// collection object as parent of multiple giftcard objects.
 public struct Collection has key{
    id: UID,
    url: String,
    name: String,
 }



 /// Giftcard object
 public struct GIFTCARD has key, store{
    id: UID,
    value: u64,
    url: String,
    balance: Balance<SUI>,
    is_used: bool,
    digits: u64,
    message: String,
    `for`: address,
 }

 

  //---------------------------------------------------------------------------
  // Events
  //---------------------------------------------------------------------------

  /// Event emitted in the spend_giftcard_from_collection function when a giftcard is spent from a collection.
  public struct Spent_Collection<phantom T> has copy, drop {
        collection: ID,
        value: u64,
        is_used: bool,
        `for`: address,
        spender: address,
    }

    /// Event emitted in the spend_giftcard function when a giftcard is spent.
  public struct Spent<phantom T> has copy, drop {
        value: u64,
        is_used: bool,
        `for`: address,
        spender: address,
    }




  //---------------------------------------------------------------------------
  // Error codes
  //---------------------------------------------------------------------------
 
   const ENotEarmarkedForAddress: u64 = 1;
   const EOwnerCannotSpend: u64 = 2;
   const EGiftcardUsed: u64 = 3;
   const ENotEnoughBalance: u64 = 4;





  //---------------------------------------------------------------------------
  // Functions
  //---------------------------------------------------------------------------

  /// create a new collection and tranfer it to the sender.
  public entry fun create_collection(url: String, name: String, ctx: &mut TxContext){
    let collection = Collection{
        id: object::new(ctx),
        url: url,
        name: name,
    };
    transfer::transfer(collection, ctx.sender());
}

  /// mint a new single giftcard nft
   entry fun mint_giftcard(
        r: &Random,
        ammount: &mut Coin<SUI>,  
        value:u64,
        url: String,
        message: String, 
        `for` : address,
        ctx: &mut TxContext,
        ){
     
      let digits = generate_digits(r, ctx);
      let coin_balance = coin::balance_mut(ammount);
      let paid = balance::split(coin_balance, value);
      
      let mut giftcard: GIFTCARD = GIFTCARD {
            id: object::new(ctx),
            value,
            url,
            balance: balance::zero(),
            is_used: false,
            digits: digits,
            message: message, 
            `for`: `for`,
        };
        balance::join(&mut giftcard.balance, paid);
        transfer::public_transfer(giftcard, ctx.sender());
    }


  /// mint multiple giftcards to collection
     entry fun mint_collection(
        collection: &mut Collection,
        r: &Random,
        ammount: &mut Coin<SUI>, 
        collection_size: u64, 
        value: u64,
        message: String, 
        `for` : address,
        ctx: &mut TxContext,
        ){
      let mut i = 0;
      let coin_balance = coin::balance_mut(ammount);
      let coin_value = coin_balance.value();
      let total_ammount = value * collection_size;
      assert!(total_ammount == coin_value, ENotEnoughBalance);
      while(i < collection_size){
      let digits = generate_digits(r, ctx);
      let paid = balance::split(coin_balance, value);
      
      let mut giftcard: GIFTCARD = GIFTCARD {
            id: object::new(ctx),
            value: value,
            url: collection.url,
            balance: balance::zero(),
            is_used: false,
            digits: digits,
            message: message, 
            `for`: `for`,
        };
        balance::join(&mut giftcard.balance, paid);
        add_to_collection(collection, giftcard);
        i = i+1
      
      }
    }


  /// add giftcard to as child to a parent collection.
    public entry fun add_to_collection(
        collection: &mut Collection, 
        giftcard: GIFTCARD,
    ){
        let digits_id = giftcard.digits;
        ofield::add(&mut collection.id, digits_id, giftcard);
    }

     
  /// generate a new randon digit for giftcards
    fun generate_digits(r: &Random, ctx: &mut TxContext): u64 {
      let mut generator = random::new_generator(r, ctx);
      let d = random::generate_u64_in_range(&mut generator, 18446744, 1844674407376);
      (d)
    }

  /// return giftcard details
  fun get_gift_card(giftcard: &GIFTCARD): (u64, bool, u64, String, String, address) {
        (giftcard.value, giftcard.is_used, giftcard.digits, giftcard.url, giftcard.message, giftcard.`for`)
      }

  /// return giftcard details from parent collection
  public fun view_from_collection( collection: &mut Collection, digits: u64): (u64, bool, u64, String, String, address){
        get_gift_card(ofield::borrow<u64, GIFTCARD>(&collection.id, digits))
   }

  /// Spend giftcard from the parent collection by tranfering the coin to the `for` address and emiting an event which can be used as confirmation.
  public entry fun spend_giftcard_from_collection(collection: &mut Collection, digit: u64, receiver: address, ctx: &mut TxContext){
    let  GIFTCARD { id, value, url, balance, is_used, digits, message, `for`,} = ofield::borrow<u64, GIFTCARD>(&mut collection.id, digit);
    assert!(is_used == false, EGiftcardUsed);
    assert!(`for` == receiver, ENotEarmarkedForAddress);
    assert!(`for` != ctx.sender(), EOwnerCannotSpend);
    
    let mut giftcard: GIFTCARD = ofield::remove(&mut collection.id, digit);
    giftcard.is_used = true;
    //object::delete(digit);
    let giftcard_value = giftcard.balance.value(); 
    transfer::public_transfer(coin::take(&mut giftcard.balance, giftcard_value, ctx), receiver);
    
      // emit event after successfull spending of giftcard.
      event::emit(Spent_Collection<GIFTCARD>{
        collection: object::id(collection),
        value: giftcard_value,
        is_used: giftcard.is_used,
        `for`: giftcard.`for`,
        spender: ctx.sender(),
        });

        transfer::transfer(giftcard, receiver);

   }

  /// claim a giftcard from the collection to wn
  public entry fun spend_giftcard(giftcard: &mut GIFTCARD, receiver: address, ctx: &mut TxContext){
   // let mut GIFTCARD { id, value, url, balance, is_used, digits, message, `for`,} = giftcard;
    assert!(giftcard.is_used == false, EGiftcardUsed);
    assert!(giftcard.`for` == receiver, ENotEarmarkedForAddress);
    assert!(giftcard.`for` != ctx.sender(), EOwnerCannotSpend);
  
    giftcard.is_used = true;
    let giftcard_value = giftcard.balance.value(); 
    transfer::public_transfer(coin::take(&mut giftcard.balance, giftcard_value, ctx), receiver);
    
      // emit event after successfull spending of giftcard.
    event::emit(Spent<GIFTCARD>{
        value: giftcard.value,
        is_used: giftcard.is_used,
        `for`: receiver,
        spender: ctx.sender(),
        });

   }
    
    }