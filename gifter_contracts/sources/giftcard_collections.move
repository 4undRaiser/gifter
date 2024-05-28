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



 /// collection object to be used in dynamic object field as registery for searching giftcard digits.
 public struct Collection has key{
    id: UID,
    name: String,
 }

/*
   public struct Payment has key, store {
        id: UID,
        //payment_id: u64,
        coin: Coin<SUI>,
    }
*/


/// Event emitted in the spend_giftcard function
  public struct Spent<phantom T> has copy, drop {
        collection: ID,
        value:u64,
        is_used: bool,
        `for`: address,
        spender: address,
    }


 /// Giftcard object
 public struct GIFTCARD has key, store{
    id: UID,
    value: u64,
    balance: Balance<SUI>,
    is_used: bool,
    digits: u64,
    chain: String,
    message: String,
    `for`: address,
 }

 
 //const GIFTCARD_DOES_NOT_EXIST: u64 = 0;
   const ENotEarmarkedForAddress: u64 = 1;
   const EOwnerCannotSpend: u64 = 2;
   const EGiftcardUsed: u64 = 3;
   const ENotEnoughBalance: u64 = 4;

public entry fun create_collection(name: String, ctx: &mut TxContext){
    let collection = Collection{
        id: object::new(ctx),
        name: name,
    };
    transfer::transfer(collection, ctx.sender());
}

    // mint a new giftcard nft
   entry fun mint_giftcard(
        r: &Random,
        chain: String, 
        ammount: &mut Coin<SUI>,  
        value:u64,
        message: String, 
        `for` : address,
        ctx: &mut TxContext,
        ){
     
      let digits = generate_digits(r, ctx);
      let coin_balance = coin::balance_mut(ammount);
      let paid = balance::split(coin_balance, value);

     // assert!(value == paid, ENotEnoughBalance);
      
      let mut giftcard: GIFTCARD = GIFTCARD {
            id: object::new(ctx),
            value,
            balance: balance::zero(),
            is_used: false,
            digits: digits,
            chain: chain,
            message: message, 
            `for`: `for`,
        };
        balance::join(&mut giftcard.balance, paid);
        transfer::public_transfer(giftcard, ctx.sender());
    }

     entry fun mint_collection(
        collection: &mut Collection,
        r: &Random,
        chain: String, 
        ammount: &mut Coin<SUI>, 
        collection_size: u64, 
        value:u64,
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
            value,
            balance: balance::zero(),
            is_used: false,
            digits: digits,
            chain: chain,
            message: message, 
            `for`: `for`,
        };
        balance::join(&mut giftcard.balance, paid);
        add_to_collection(collection, giftcard);
        i = i+1
        //transfer::public_transfer(giftcard, ctx.sender());
      }
    }

    public entry fun add_to_collection(
        collection: &mut Collection, 
        giftcard: GIFTCARD,
    ){
        let digits_id = giftcard.digits;
        ofield::add(&mut collection.id, digits_id, giftcard);
    }

     

    fun generate_digits(r: &Random, ctx: &mut TxContext): u64 {
      let mut generator = random::new_generator(r, ctx);
      let d = random::generate_u64_in_range(&mut generator, 18446744, 1844674407376);
      (d)
    }

   
     fun get_gift_card(giftcard: &GIFTCARD): (String, String) {
       // let balance = giftcard.balance as u64; 
        (giftcard.message, giftcard.chain)
        //giftcard.ammount
      }

     public fun view_giftcard( collection: &mut Collection, digit: u64): (String, String){
        get_gift_card(ofield::borrow<u64, GIFTCARD>(&collection.id, digit))
   }


   public entry fun spend_giftcard(collection: &mut Collection, digit: u64, receiver: address, ctx: &mut TxContext){
    let  GIFTCARD { id, value, balance, is_used, digits, chain, message, `for`,} = ofield::borrow<u64, GIFTCARD>(&mut collection.id, digit);
    assert!(is_used == false, EGiftcardUsed);
    assert!(`for` == receiver, ENotEarmarkedForAddress);
    assert!(`for` != ctx.sender(), EOwnerCannotSpend);
    
    let mut giftcard: GIFTCARD = ofield::remove(&mut collection.id, digit);
    giftcard.is_used = true;
    //object::delete(digit);
    let giftcard_value = giftcard.balance.value(); 
    transfer::public_transfer(coin::take(&mut giftcard.balance, giftcard_value, ctx), receiver);
    

      event::emit(Spent<GIFTCARD>{
        collection: object::id(collection),
        value: giftcard_value,
        is_used: giftcard.is_used,
        `for`: giftcard.`for`,
        spender: ctx.sender(),
        });

        transfer::public_transfer(giftcard, ctx.sender());
  
   }
    
    }