import React, { useState, useEffect, useRef} from 'react';

import { connect } from 'react-redux';
import { loadCart, removeProduct, changeProductQuantity } from '../../services/cart/actions';
import { updateCart } from '../../services/total/actions';
import CartProduct from './CartProduct';
import { formatPrice } from '../../services/util';

import './style.scss';

/*
Custom hook to provide a previous props using useRef
https://stackoverflow.com/questions/53446020/how-to-compare-oldvalues-and-newvalues-on-react-hooks-useeffect
*/
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}


function FloatCart(props) {
    let [isOpen, setIsOpen] = useState(false);
    const openFloatCart     = () =>  setIsOpen(true); 
    const closeFloatCart    = () =>  setIsOpen(false); 
    const prevProduct = usePrevious(props.newProduct);

/*
componentWillReceiveProps(nextProps)

- Bug, useEffect:
  - load page                      -> props.newProduct = undefined 
  - instantly, without user input  -> props.newProduct = {id: 12, sku: 12064273040195392 ...} 
  
  Result:
   The page has a item in the cart without an user input

  comment :
    I tried the combination in the array of dependencies:

    [prevProduct]                    => click 'Add to cart' => 2 items in the cart
    [prevProduct, props.newProduct] => click 'Add to cart'  => 2 items in the cart

- In the original function there were 2 additional cases: 
  - nextProps.productRemove 
  - nextProps.productChange 

...
    if (nextProps.productToRemove !== this.props.productToRemove) {
      this.removeProduct(nextProps.productToRemove);
    }

    if (nextProps.productToChange !== this.props.productToChange) {
      this.changeProductQuantity(nextProps.productToChange);
    }

I didn't implented the functions but, it seems that the program is working ok (?)
 */   
    useEffect(() => {
       if(prevProduct !== undefined ) {
            addProduct(props.newProduct);
        }

    },[props.newProduct]);

    const addProduct = product => {
       const { cartProducts, updateCart } = props;
       let productAlreadyInCart = false;

       cartProducts.forEach(cp => {
         if (cp.id === product.id) {
           cp.quantity += product.quantity;
           productAlreadyInCart = true;
         }
       });

       if (!productAlreadyInCart) {
         cartProducts.push(product);
       }

    updateCart(cartProducts);
    openFloatCart();
  };

  const removeProduct = product => {

   const { cartProducts, updateCart } = props;
   const index = cartProducts.findIndex(p => p.id === product.id);
      if (index >= 0) {
      cartProducts.splice(index, 1);
      updateCart(cartProducts);
    }
  };

  const proceedToCheckout = () => {
    const {
      totalPrice,
      productQuantity,
      currencyFormat,
      currencyId
    } = props.cartTotal;

    if (!productQuantity) {
      alert('Add some product in the cart!');
    } else {
      alert(
        `Checkout - Subtotal: ${currencyFormat} ${formatPrice(
          totalPrice,
          currencyId
        )}`
      );
    }
  };
    
 const changeProductQuantity = changedProduct => {
    const { cartProducts, updateCart } = props;

    const product = cartProducts.find(p => p.id === changedProduct.id);
    product.quantity = changedProduct.quantity;

    if (product.quantity <= 0) {
      removeProduct(product);
    }

    updateCart(cartProducts);
 };
     const { cartTotal, cartProducts  } = props; 
     const products = cartProducts.map(p => {
       return (
        <CartProduct product={p} removeProduct={removeProduct} changeProductQuantity={changeProductQuantity} key={p.id} />
       );
    });
    let classes = ['float-cart'];
    if (!!isOpen) {classes.push('float-cart--open'); }

   return (

     <div className={classes.join(' ')}>
        {/* If cart open, show close (x) button */}
        {isOpen && (
          <div
            onClick={() => closeFloatCart()}
            className="float-cart__close-btn"
          >
            X
          </div>
        )}

        {/* If cart is closed, show bag with quantity of product and open cart action */}
        {!isOpen && (
          <span
            onClick={() => openFloatCart()}
            className="bag bag--float-cart-closed"
          >
            <span className="bag__quantity">{cartTotal.productQuantity}</span>
          </span>
        )}

        <div className="float-cart__content">
          <div className="float-cart__header">
            <span className="bag">
              <span className="bag__quantity">{cartTotal.productQuantity}</span>
            </span>
            <span className="header-title">Cart</span>
          </div>

          <div className="float-cart__shelf-container">
            {products}
            {!products.length && (
              <p className="shelf-empty">
                Add some products in the cart <br />
                :)
              </p>
            )}
          </div>

          <div className="float-cart__footer">
            <div className="sub">SUBTOTAL</div>
            <div className="sub-price">
              <p className="sub-price__val">
                {`${cartTotal.currencyFormat} ${formatPrice(
                  cartTotal.totalPrice,
                  cartTotal.currencyId
                )}`}
              </p>
              <small className="sub-price__installment">
                {!!cartTotal.installments && (
                  <span>
                    {`OR UP TO ${cartTotal.installments} x ${
                      cartTotal.currencyFormat
                    } ${formatPrice(
                      cartTotal.totalPrice / cartTotal.installments,
                      cartTotal.currencyId
                    )}`}
                  </span>
                )}
              </small>
            </div>
            <div onClick={() => proceedToCheckout()} className="buy-btn">
              Checkout
            </div>
          </div>
        </div>
      </div>
    );
   
   
}



const mapStateToProps = state => ({
  cartProducts: state.cart.products,
  newProduct: state.cart.productToAdd,
  productToRemove: state.cart.productToRemove,
  productToChange: state.cart.productToChange,
  cartTotal: state.total.data
});

export default connect(
  mapStateToProps,
  { loadCart, updateCart, removeProduct, changeProductQuantity }
)(FloatCart);
