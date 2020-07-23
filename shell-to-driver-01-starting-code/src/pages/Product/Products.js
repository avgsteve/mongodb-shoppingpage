/* jshint esversion: 6 */
/* jshint esversion: 8 */
import React, { Component } from 'react';
import axios from 'axios';

import Products from '../../components/Products/Products';

class ProductsPage extends Component {

  //
  state = {
    isLoading: true,
    products: []
  };

  // use this.fetchData() to get data with Axios from Backend server
  componentDidMount() {
    this.fetchData();
  }

  // function for deleting doument from MongoDB via backend server
  productDeleteHandler = productId => {

    axios.delete( 'http://localhost:3100/products/' + productId ).then( result => {
      console.log( result );
      this.fetchData();

    } ).catch( err => {
      this.props.onError( 'Deleting the product failed. Please try again later' );
      console.log( err );
    } );
  };

  // fetch data again after deleting document from database
  fetchData = () => {
    axios.get( 'http://localhost:3100/products' )

    // when successfully delete document
      .then( productsResponse => {
      this.setState( { isLoading: false, products: productsResponse.data } );
    } )

    //if  fail to delete document
      .catch( err => {
      this.setState( { isLoading: false, products: [] } );
      this.props.onError( 'Loading products failed. Please try again later' );
      console.log( err );
    } );
  };

  //render content when loading the document from the item link on the page
  render() {
    let content = <p>Loading products...</p>;

    if ( !this.state.isLoading && this.state.products.length > 0 ) {
      content = ( <Products products={this.state.products} onDeleteProduct={this.productDeleteHandler}/> );
    }
    if ( !this.state.isLoading && this.state.products.length === 0 ) {
      content = <p>Found no products. Try again later.</p>;
    }
    return <main>{content}</main>;
  }
}

export default ProductsPage;
