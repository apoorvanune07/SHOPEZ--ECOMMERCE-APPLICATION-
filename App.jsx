import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [apiStatus, setApiStatus] = useState('loading') // 'loading' | 'online' | 'offline'
  const [dbStatus, setDbStatus] = useState('loading')   // 'loading' | 'online' | 'offline'
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState(null)

  // Auth & View States
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('shopez_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [view, setView] = useState('home'); // 'home' | 'login' | 'register' | 'checkout' | 'profile'
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('shopez_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [cartOpen, setCartOpen] = useState(false);

  // Form States
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

  // Login/Register States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [authError, setAuthError] = useState(null);

  // Orders History State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All'); // 'All' | 'Electronics' | 'Clothing' | 'Accessories'

  // Fetch API Status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/status');
        if (!response.ok) throw new Error('Failed to fetch status');
        const data = await response.json();
        setApiStatus(data.status === 'running' ? 'online' : 'offline');
        setDbStatus(data.database === 'connected' ? 'online' : 'offline');
      } catch (err) {
        setApiStatus('offline');
        setDbStatus('offline');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Products Catalog
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true)
        const response = await fetch('http://localhost:5000/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data);
        setProductsError(null);
      } catch (err) {
        setProductsError(err.message);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch Current User Orders
  const fetchMyOrders = async () => {
    if (!user) return;
    try {
      setOrdersLoading(true);
      const response = await fetch('http://localhost:5000/api/orders/myorders', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch orders');
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'profile' && user) {
      fetchMyOrders();
    }
  }, [view, user]);

  // Cart Operations
  const addToCart = (product) => {
    setCart((prevCart) => {
      const exist = prevCart.find((x) => x._id === product._id);
      let newCart;
      if (exist) {
        newCart = prevCart.map((x) =>
          x._id === product._id ? { ...exist, qty: exist.qty + 1 } : x
        );
      } else {
        newCart = [...prevCart, { ...product, qty: 1 }];
      }
      localStorage.setItem('shopez_cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((x) => x._id !== productId);
      localStorage.setItem('shopez_cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) return;
    setCart((prevCart) => {
      const newCart = prevCart.map((x) =>
        x._id === productId ? { ...x, qty: newQty } : x
      );
      localStorage.setItem('shopez_cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('shopez_cart');
  };

  // Auth Operations
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');
      setUser(data);
      localStorage.setItem('shopez_user', JSON.stringify(data));
      setView('home');
      setLoginEmail('');
      setLoginPassword('');
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: registerName, email: registerEmail, password: registerPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');
      setUser(data);
      localStorage.setItem('shopez_user', JSON.stringify(data));
      setView('home');
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPassword('');
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('shopez_user');
    setView('home');
    setOrders([]);
  };

  // Checkout Operations
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      setView('login');
      return;
    }

   const cartTotal = cart.reduce(
  (acc, item) =>
    acc +
    (item.discount
      ? item.price * (1 - item.discount / 100)
      : item.price) *
      item.qty,
  0
);
    const orderPayload = {
      orderItems: cart.map(item => ({
        name: item.name,
        qty: item.qty,
        price: item.price,
        imageUrl: item.imageUrl,
        product: item._id
      })),
      shippingAddress: {
        address,
        city,
        postalCode,
        country
      },
      paymentMethod,
      totalPrice: cartTotal
    };

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(orderPayload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Checkout failed');

      clearCart();
      setView('profile');
      setCheckoutSuccess(true);
      setTimeout(() => setCheckoutSuccess(false), 4000);

      // Reset Shipping Form
      setAddress('');
      setCity('');
      setPostalCode('');
      setCountry('');
    } catch (err) {
      alert(err.message);
    }
  };

  // Cart helper quantities
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <>
      <header className="navbar">
        <div className="logo-container" onClick={() => setView('home')} style={{ cursor: 'pointer' }}>
          <h1 className="logo-text">ShopEZ<span className="logo-dot">.</span></h1>
        </div>
        <nav className="nav-actions">
          <button type="button" className={`nav-link-btn ${view === 'home' ? 'active' : ''}`} onClick={() => setView('home')}>Home</button>
          
          {user ? (
            <>
              <button type="button" className={`nav-link-btn ${view === 'profile' ? 'active' : ''}`} onClick={() => setView('profile')}>Profile</button>
              <button type="button" className="nav-link-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <button type="button" className={`nav-link-btn ${view === 'login' ? 'active' : ''}`} onClick={() => setView('login')}>Login</button>
          )}

          <button type="button" className="cart-toggle-btn" onClick={() => setCartOpen(true)}>
            <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
            Cart
            {cartCount > 0 && <span className="cart-count-badge">{cartCount}</span>}
          </button>
        </nav>
      </header>

      {/* View Rendering */}
      {view === 'home' && (
        <>
          <section id="center">
            <div className="hero">
              <img src={heroImg} className="base" width="170" height="179" alt="" />
              <img src={reactLogo} className="framework" alt="React logo" />
              <img src={viteLogo} className="vite" alt="Vite logo" />
            </div>
            <div>
              <h1>ShopEZ Store</h1>
              <p>Experience clean and premium full-stack shopping</p>
            </div>
            
            <div className="status-container">
              <div className="status-badge">
                <span className={`status-dot ${apiStatus}`}></span>
                Backend API: {apiStatus === 'online' ? 'Online' : apiStatus === 'offline' ? 'Offline' : 'Connecting...'}
              </div>
              <div className="status-badge">
                <span className={`status-dot ${dbStatus}`}></span>
                Database: {dbStatus === 'online' ? 'Connected' : dbStatus === 'offline' ? 'Disconnected' : 'Connecting...'}
              </div>
            </div>
          </section>

          <div className="ticks"></div>

          <section className="catalog-section">
            <div className="catalog-header">
              <h2 className="catalog-title">Discover Products</h2>
              <p className="catalog-subtitle">Explore our premium selection of top-rated items</p>
            </div>

            {!productsLoading && !productsError && (
              <div className="category-tabs-container">
                {['All', 'Electronics', 'Clothing', 'Accessories'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat} <span className="tab-count">({
                      cat === 'All' ? products.length : products.filter(p => p.category === cat).length
                    })</span>
                  </button>
                ))}
              </div>
            )}

            {productsLoading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading catalog items...</p>
              </div>
            ) : productsError ? (
              <div className="loading-container">
                <p style={{ color: 'var(--accent)' }}>Failed to load catalog. Ensure your backend server is active.</p>
              </div>
            ) : (
              <div className="catalog-grid">
                {products
                  .filter((product) => activeCategory === 'All' || product.category.toLowerCase() === activeCategory.toLowerCase())
                  .map((product) => (
                    <div key={product._id} className="product-card">
                      <span className="product-category-tag">{product.category}</span>
                      <div className="product-image-wrapper">
                        <img 
                          className="product-img" 
                          src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'} 
                          alt={product.name} 
                        />
                      </div>
                      <div className="product-content">
                        <div className="product-details">
                          <h3 className="product-title-text">{product.name}</h3>
                         <div className="product-price-tag">
  {product.discount ? (
    <>
      <span
        style={{
          textDecoration: 'line-through',
          opacity: 0.6,
          marginRight: '8px'
        }}
      >
        ₹{product.price.toFixed(2)}
      </span>

      <span>
        ₹{(
          product.price *
          (1 - product.discount / 100)
        ).toFixed(2)}
      </span>

      <span
        style={{
          color: '#22c55e',
          marginLeft: '8px',
          fontSize: '0.9rem'
        }}
      >
        {product.discount}% OFF
      </span>
    </>
  ) : (
    <>₹{product.price.toFixed(2)}</>
  )}
  </div>
                        </div>
                        <p className="product-desc-text">{product.description}</p>
                        <div className="product-action-bar">
                          <span className="stock-indicator">
                            {product.stock > 0 ? (
                              <>
                                <span className="status-dot online" style={{ width: '8px', height: '8px' }}></span>
                                <span className="stock-in">{product.stock} In Stock</span>
                              </>
                            ) : (
                              <>
                                <span className="status-dot offline" style={{ width: '8px', height: '8px' }}></span>
                                <span className="stock-out">Out of Stock</span>
                              </>
                            )}
                          </span>
                          <button type="button" className="buy-btn" onClick={() => addToCart(product)}>Add to Cart</button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>

          <div className="ticks"></div>
          
          <section id="next-steps">
            <div id="docs">
              <svg className="icon" role="presentation" aria-hidden="true">
                <use href="/icons.svg#documentation-icon"></use>
              </svg>
              <h2>Authentication & Checkout Flow</h2>
              <p>You can register an account, add items to your cart, fill in payment details, and check your orders in your user profile.</p>
            </div>
          </section>
          <div className="ticks"></div>
          <section id="spacer"></section>
        </>
      )}

      {view === 'login' && (
        <section className="form-section">
          <div className="form-card">
            <h2 className="form-title">Welcome Back</h2>
            <p className="form-subtitle">Login to process your checkout and view orders</p>
            {authError && <div className="auth-error">{authError}</div>}
            
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={loginEmail} 
                  onChange={(e) => setLoginEmail(e.target.value)} 
                  placeholder="name@example.com" 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={loginPassword} 
                  onChange={(e) => setLoginPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                />
              </div>
              <button type="submit" className="submit-btn">Sign In</button>
            </form>
            <p className="auth-switch-text">
              Don't have an account yet? <span className="auth-switch-link" onClick={() => setView('register')}>Register here</span>
            </p>
          </div>
        </section>
      )}

      {view === 'register' && (
        <section className="form-section">
          <div className="form-card">
            <h2 className="form-title">Join ShopEZ</h2>
            <p className="form-subtitle">Register to explore personal orders and fast checkout</p>
            {authError && <div className="auth-error">{authError}</div>}
            
            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={registerName} 
                  onChange={(e) => setRegisterName(e.target.value)} 
                  placeholder="John Doe" 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={registerEmail} 
                  onChange={(e) => setRegisterEmail(e.target.value)} 
                  placeholder="name@example.com" 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={registerPassword} 
                  onChange={(e) => setRegisterPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                />
              </div>
              <button type="submit" className="submit-btn">Create Account</button>
            </form>
            <p className="auth-switch-text">
              Already registered? <span className="auth-switch-link" onClick={() => setView('login')}>Login here</span>
            </p>
          </div>
        </section>
      )}

      {view === 'checkout' && (
        <section className="form-section">
          <div className="form-card">
            <h2 className="form-title">Shipping & Payment</h2>
            <p className="form-subtitle">Finalize your order details to place order</p>
            
            <form onSubmit={handlePlaceOrder} className="auth-form">
              <div className="form-group">
                <label className="form-label">Shipping Address</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  placeholder="Street Address" 
                  required 
                />
              </div>
              <div className="form-group-row">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)} 
                    placeholder="City" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Postal Code</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={postalCode} 
                    onChange={(e) => setPostalCode(e.target.value)} 
                    placeholder="Postal Code" 
                    required 
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={country} 
                  onChange={(e) => setCountry(e.target.value)} 
                  placeholder="Country" 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="Credit Card" 
                      checked={paymentMethod === 'Credit Card'} 
                      onChange={(e) => setPaymentMethod(e.target.value)} 
                    />
                    Credit Card
                  </label>
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="PayPal" 
                      checked={paymentMethod === 'PayPal'} 
                      onChange={(e) => setPaymentMethod(e.target.value)} 
                    />
                    PayPal
                  </label>
                </div>
              </div>

              <div className="order-summary-box">
                <div className="order-summary-item">
                  <span>Cart Items:</span>
                  <span>{cartCount}</span>
                </div>
                <div className="order-summary-item total">
                  <span>Order Total:</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <button type="submit" className="submit-btn">Place Order</button>
            </form>
          </div>
        </section>
      )}

      {view === 'profile' && (
        <section className="profile-section">
          <div className="profile-header-card">
            <h2 className="profile-name">Hello, {user?.name}</h2>
            <p className="profile-email">{user?.email}</p>
            <span className="profile-badge">{user?.isAdmin ? 'Admin Account' : 'Customer Account'}</span>
          </div>

          <div className="orders-container">
            <h3 className="orders-title">My Orders</h3>
            
            {ordersLoading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Fetching your orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="no-orders-box">
                <p>You haven't placed any orders yet.</p>
                <button type="button" className="buy-btn" onClick={() => setView('home')}>Start Shopping</button>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order._id} className="order-card">
                    <div className="order-card-header">
                      <div>
                        <span className="order-meta-label">ORDER PLACED</span>
                        <p className="order-meta-val">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="order-meta-label">TOTAL</span>
                        <p className="order-meta-val">₹{order.totalPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="order-meta-label">SHIP TO</span>
                        <p className="order-meta-val">{order.shippingAddress.address}, {order.shippingAddress.city}</p>
                      </div>
                      <div className="order-id-col">
                        <span className="order-meta-label">ORDER #</span>
                        <p className="order-meta-val font-mono">{order._id.substring(12)}</p>
                      </div>
                    </div>
                    <div className="order-card-body">
                      <div className="order-status-row">
                        <span className="order-status-badge paid">Paid</span>
                        <span className={`order-status-badge ${order.isDelivered ? 'delivered' : 'pending'}`}>
                          {order.isDelivered ? 'Delivered' : 'Processing'}
                        </span>
                      </div>
                      <div className="order-items-list">
                        {order.orderItems.map((item, idx) => (
                          <div key={idx} className="order-item-row">
                            <img src={item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'} alt={item.name} className="order-item-img" />
                            <div className="order-item-details">
                              <p className="order-item-name">{item.name}</p>
                              <p className="order-item-meta">Qty: {item.qty} &bull; ₹{item.price.toFixed(2)} each</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Cart Drawer Overlay & Sidebar */}
      <div className={`cart-drawer-overlay ${cartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)}></div>
      <div className={`cart-drawer ${cartOpen ? 'open' : ''}`}>
        <div className="cart-drawer-header">
          <h3 className="cart-drawer-title">Shopping Cart ({cartCount})</h3>
          <button type="button" className="close-drawer-btn" onClick={() => setCartOpen(false)}>&times;</button>
        </div>

        <div className="cart-drawer-body">
          {cart.length === 0 ? (
            <div className="empty-cart-message">
              <div className="empty-cart-icon">🛒</div>
              <p>Your shopping cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item._id} className="cart-drawer-item">
                <div className="cart-item-img-wrapper">
                  <img src={item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'} alt={item.name} className="cart-item-img" />
                </div>
                <div className="cart-item-details">
                  <h4 className="cart-item-name">{item.name}</h4>
                  <p className="cart-item-price">₹{item.price.toFixed(2)}</p>
                  <div className="cart-item-controls">
                    <div className="qty-selector">
                      <button type="button" className="qty-btn" onClick={() => updateQuantity(item._id, item.qty - 1)}>-</button>
                      <span className="qty-val">{item.qty}</span>
                      <button type="button" className="qty-btn" onClick={() => updateQuantity(item._id, item.qty + 1)}>+</button>
                    </div>
                    <button type="button" className="remove-item-btn" onClick={() => removeFromCart(item._id)}>Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-summary-row">
              <span className="cart-summary-label">Subtotal</span>
              <span className="cart-summary-val">₹{cartTotal.toFixed(2)}</span>
            </div>
            <div className="cart-action-buttons">
              <button 
                type="button" 
                className="checkout-btn" 
                onClick={() => {
                  setCartOpen(false);
                  if (user) {
                    setView('checkout');
                  } else {
                    setView('login');
                  }
                }}
              >
                Proceed to Checkout
              </button>
              <button type="button" className="clear-cart-btn" onClick={clearCart}>Clear Cart</button>
            </div>
          </div>
        )}
      </div>

      {/* Success Notification */}
      <div className={`checkout-success-banner ${checkoutSuccess ? 'show' : ''}`}>
        <span>🎉 Order Placed Successfully! View it in your Profile.</span>
      </div>
    </>
  )
}

export default App
