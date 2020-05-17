import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsInStorage = await AsyncStorage.getItem(
        '@GoMarketPlace:Products',
      );
      if (productsInStorage) {
        setProducts(JSON.parse(productsInStorage));
      }
      console.log(productsInStorage, 'stirage');
      // TODO LOAD ITEMS FROM ASYNC STORAGE
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const productIndex = products.findIndex(p => p.id === product.id);
      if (productIndex < 0) {
        setProducts([...products, { ...product, quantity: 1 }]);
        await AsyncStorage.setItem(
          '@GoMarketPlace:Products',
          JSON.stringify([...products, { ...product, quantity: 1 }]),
        );
      } else {
        const productsToUpdate = [...products];
        productsToUpdate[productIndex].quantity =
          products[productIndex].quantity + 1;
        setProducts(productsToUpdate);
        await AsyncStorage.setItem(
          '@GoMarketPlace:Products',
          JSON.stringify(productsToUpdate),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productIndex = products.findIndex(p => p.id === id);

      const productsToUpdate = [...products];
      productsToUpdate[productIndex].quantity =
        products[productIndex].quantity + 1;
      setProducts(productsToUpdate);
      await AsyncStorage.setItem(
        '@GoMarketPlace:Products',
        JSON.stringify(productsToUpdate),
      );
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const productIndex = products.findIndex(p => p.id === id);

      const productsToUpdate = [...products];
      if (productsToUpdate[productIndex].quantity <= 1) {
        productsToUpdate.splice(productIndex, 1);
      } else {
        productsToUpdate[productIndex].quantity =
          products[productIndex].quantity - 1;
      }
      setProducts(productsToUpdate);
      await AsyncStorage.setItem(
        '@GoMarketPlace:Products',
        JSON.stringify(productsToUpdate),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
