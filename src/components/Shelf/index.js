import React                             from 'react';
import { useState, useEffect } from 'react';

import { connect } from 'react-redux';

import { fetchProducts } from '../../services/shelf/actions';

import Spinner from '../Spinner';
import ShelfHeader from './ShelfHeader';
import ProductList from './ProductList';

import './style.scss';

function Shelf (props) {
    let [ isLoading, setIsLoading ] = useState(false);
    let [ products,  setProducts ]   = useState([]);
    let {filters, sort, fetchProducts} = props;

    useEffect( () => {
        let productsData = fetchProducts(filters, sort, setIsLoading(false));
        setProducts(productsData.payload);
    },[ filters, sort, fetchProducts]);

    
   return (
      <React.Fragment>
        {isLoading && <Spinner />}
        <div className="shelf-container">
          <ShelfHeader productsLength={products.length} />
          <ProductList products={products} />
        </div>
      </React.Fragment>
    );
}

const mapStateToProps = state => ({
  products: state.shelf.products,
  filters: state.filters.items,
  sort: state.sort.type
});

export default connect(
  mapStateToProps,
  { fetchProducts }
)(Shelf);
