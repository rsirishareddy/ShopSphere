import axios from "axios";
import { useEffect, useState } from "react";
import AddProduct from "./AddProduct";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortOption, setSortOption] = useState("Default");

  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("cart")) || []);
  const [wishlist, setWishlist] = useState(JSON.parse(localStorage.getItem("wishlist")) || []);
  const [darkMode, setDarkMode] = useState(JSON.parse(localStorage.getItem("darkMode")) || false);
  const [ratings, setRatings] = useState(JSON.parse(localStorage.getItem("ratings")) || {});
  const [orders, setOrders] = useState(JSON.parse(localStorage.getItem("orders")) || []);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [reviews, setReviews] = useState(JSON.parse(localStorage.getItem("reviews")) || {});
  const [inventory, setInventory] = useState(JSON.parse(localStorage.getItem("inventory")) || {});
  const [reviewInputs, setReviewInputs] = useState({});

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toast, setToast] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editImage, setEditImage] = useState("");

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  }

  async function fetchProducts() {
    try {
      const res = await axios.get("http://127.0.0.1:4000/products");
      setProducts(res.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const updatedInventory = { ...inventory };

      products.forEach((product) => {
        if (updatedInventory[product._id] === undefined) {
          updatedInventory[product._id] = 10;
        }
      });

      setInventory(updatedInventory);
    }
  }, [products]);

  useEffect(() => localStorage.setItem("cart", JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem("wishlist", JSON.stringify(wishlist)), [wishlist]);
  useEffect(() => localStorage.setItem("darkMode", JSON.stringify(darkMode)), [darkMode]);
  useEffect(() => localStorage.setItem("ratings", JSON.stringify(ratings)), [ratings]);
  useEffect(() => localStorage.setItem("orders", JSON.stringify(orders)), [orders]);
  useEffect(() => localStorage.setItem("user", JSON.stringify(user)), [user]);
  useEffect(() => localStorage.setItem("reviews", JSON.stringify(reviews)), [reviews]);
  useEffect(() => localStorage.setItem("inventory", JSON.stringify(inventory)), [inventory]);

  async function handleSignup() {
    if (email.trim() === "" || password.trim() === "") {
      showToast("Please enter email and password");
      return;
    }

    try {
      const res = await axios.post("http://localhost:4000/signup", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);

      showToast("Signup successful");
      setEmail("");
      setPassword("");
    } catch (error) {
      showToast(error.response?.data?.message || "Signup failed");
    }
  }

  async function handleLogin() {
    if (email.trim() === "" || password.trim() === "") {
      showToast("Please enter email and password");
      return;
    }

    try {
      const res = await axios.post("http://localhost:4000/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);

      showToast("Login successful");
      setEmail("");
      setPassword("");
    } catch (error) {
      showToast(error.response?.data?.message || "Login failed");
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setUser(null);
    showToast("Logged out successfully");
  }

  function handleRating(productId, rating) {
    setRatings({ ...ratings, [productId]: rating });
    showToast("⭐ Rating added");
  }

  function addReview(productId) {
    const text = reviewInputs[productId];

    if (!text || text.trim() === "") {
      showToast("Please enter a review");
      return;
    }

    const oldReviews = reviews[productId] || [];

    setReviews({
      ...reviews,
      [productId]: [...oldReviews, text],
    });

    setReviewInputs({
      ...reviewInputs,
      [productId]: "",
    });

    showToast("💬 Review added");
  }

  function addToWishlist(product) {
    const alreadyExists = wishlist.find((item) => item._id === product._id);

    if (alreadyExists) {
      showToast("Product already in wishlist");
      return;
    }

    setWishlist([...wishlist, product]);
    showToast("❤️ Product added to wishlist");
  }

  function removeFromWishlist(id) {
    setWishlist(wishlist.filter((item) => item._id !== id));
    showToast("Removed from wishlist");
  }

  function getStock(id) {
    return inventory[id] !== undefined ? inventory[id] : 10;
  }

  function addToCart(product) {
    const stock = getStock(product._id);
    const existingProduct = cart.find((item) => item._id === product._id);
    const currentQuantity = existingProduct ? existingProduct.quantity : 0;

    if (stock <= 0) {
      showToast("Product is out of stock");
      return;
    }

    if (currentQuantity >= stock) {
      showToast("No more stock available");
      return;
    }

    if (existingProduct) {
      setCart(
        cart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }

    showToast("🛒 Product added to cart");
  }

  function increaseQuantity(id) {
    const stock = getStock(id);
    const cartItem = cart.find((item) => item._id === id);

    if (cartItem && cartItem.quantity >= stock) {
      showToast("No more stock available");
      return;
    }

    setCart(
      cart.map((item) =>
        item._id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }

  function decreaseQuantity(id) {
    setCart(
      cart
        .map((item) =>
          item._id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(id) {
    setCart(cart.filter((item) => item._id !== id));
    showToast("Removed from cart");
  }

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  const productsSold = orders.reduce(
    (total, order) =>
      total + order.items.reduce((sum, item) => sum + item.quantity, 0),
    0
  );

  const totalRevenue = orders.reduce(
    (total, order) => total + Number(order.total),
    0
  );

  const totalAmount = cart.reduce(
    (total, item) => total + Number(item.new_price) * item.quantity,
    0
  );

  const finalAmount = totalAmount - discount;

  function applyCoupon() {
    if (cart.length === 0) {
      showToast("Cart is empty");
      return;
    }

    const code = coupon.trim().toUpperCase();

    if (code === "SAVE10") {
      setDiscount(totalAmount * 0.1);
      showToast("10% discount applied");
    } else if (code === "SHOP20") {
      setDiscount(totalAmount * 0.2);
      showToast("20% discount applied");
    } else if (code === "WELCOME50") {
      setDiscount(50);
      showToast("₹50 discount applied");
    } else if (code === "SIRISHA100") {
      setDiscount(100);
      showToast("₹100 discount applied");
    } else {
      setDiscount(0);
      showToast("Invalid coupon");
    }
  }

  function updateOrderStatus(orderId, newStatus) {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    showToast(`Order marked as ${newStatus}`);
  }

  function handleCheckout() {
    if (!user) {
      showToast("Please login before checkout");
      return;
    }

    if (cart.length === 0) {
      showToast("Cart is empty");
      return;
    }

    const newInventory = { ...inventory };

    cart.forEach((item) => {
      newInventory[item._id] = getStock(item._id) - item.quantity;
    });

    const newOrder = {
      id: Date.now(),
      items: cart,
      total: finalAmount,
      status: "Order Placed",
      paymentMethod,
      paymentStatus: paymentMethod === "Cash on Delivery" ? "Pending" : "Paid",
    };

    setInventory(newInventory);
    setOrders([...orders, newOrder]);

    if (paymentMethod === "Cash on Delivery") {
      showToast("Order placed with Cash on Delivery");
    } else {
      showToast("💳 Payment successful. Order placed!");
    }

    setCart([]);
    setCoupon("");
    setDiscount(0);
    setPaymentMethod("Cash on Delivery");
  }

  async function handleDelete(id) {
    try {
      await axios.delete(`http://127.0.0.1:4000/deleteproduct/${id}`);
      showToast("Product deleted");
      fetchProducts();
      setCart(cart.filter((item) => item._id !== id));
      setWishlist(wishlist.filter((item) => item._id !== id));
    } catch (error) {
      console.log(error);
      showToast("Delete error");
    }
  }

  function startEdit(product) {
    setEditingId(product._id);
    setEditName(product.name);
    setEditPrice(product.new_price);
    setEditCategory(product.category);
    setEditImage(product.image || "");
  }

  async function handleUpdate(id) {
    try {
      await axios.put(`http://127.0.0.1:4000/updateproduct/${id}`, {
        name: editName,
        new_price: Number(editPrice),
        category: editCategory,
        image: editImage,
      });

      showToast("Product updated");
      setEditingId(null);
      fetchProducts();
    } catch (error) {
      console.log(error);
      showToast("Update error");
    }
  }

  const categories = ["All", ...new Set(products.map((p) => p.category))];

  let filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" || product.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  if (sortOption === "LowToHigh") {
    filteredProducts = [...filteredProducts].sort(
      (a, b) => Number(a.new_price) - Number(b.new_price)
    );
  }

  if (sortOption === "HighToLow") {
    filteredProducts = [...filteredProducts].sort(
      (a, b) => Number(b.new_price) - Number(a.new_price)
    );
  }

  return (
    <div className={darkMode ? "app dark-mode" : "app"}>
      {toast && <div className="toast">{toast}</div>}

      <nav className="navbar">
        <h2>🛒 ShopSphere</h2>

        <div className="nav-links">
          <span>Home</span>
          <span>Products</span>
          <span>Wishlist ❤️: {wishlist.length}</span>
          <span>Cart 🛍️: {totalItems}</span>
        </div>
      </nav>

      <h1 className="main-title">ShopSphere</h1>
      <p className="subtitle">Product Management Dashboard</p>

      <button className="dark-btn" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Products</h3>
          <p>{products.length}</p>
        </div>

        <div className="stat-card">
          <h3>Cart Items</h3>
          <p>{totalItems}</p>
        </div>

        <div className="stat-card">
          <h3>Wishlist</h3>
          <p>{wishlist.length}</p>
        </div>

        <div className="stat-card">
          <h3>Orders</h3>
          <p>{orders.length}</p>
        </div>

        <div className="stat-card">
          <h3>Total Amount</h3>
          <p>₹{totalAmount}</p>
        </div>

        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p>₹{totalRevenue}</p>
        </div>

        <div className="stat-card">
          <h3>Products Sold</h3>
          <p>{productsSold}</p>
        </div>
      </div>

      <div className="section auth-section">
        <h2>🔐 Login / Signup</h2>

        {user ? (
          <>
            <h3>Welcome, {user.email} 👋</h3>

            <button className="delete-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="button-group">
              <button className="login-btn" onClick={handleLogin}>
                Login
              </button>

              <button className="signup-btn" onClick={handleSignup}>
                Signup
              </button>
            </div>
          </>
        )}
      </div>

      {user && (
        <div className="section profile-section">
          <h2>👤 User Profile</h2>
          <p>Email: {user.email}</p>
          <p>Cart Items: {totalItems}</p>
          <p>Wishlist Items: {wishlist.length}</p>
          <p>Total Orders: {orders.length}</p>
          <p>Total Revenue: ₹{totalRevenue}</p>
        </div>
      )}

      {selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-box">
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="modal-image"
            />

            <h2>{selectedProduct.name}</h2>
            <p>Price: ₹{selectedProduct.new_price}</p>
            <p>Category: {selectedProduct.category}</p>
            <p>Stock: {getStock(selectedProduct._id)}</p>
            <p>Rating: {ratings[selectedProduct._id] || 0}/5 ⭐</p>
            <p>This is a high-quality product available in ShopSphere.</p>

            <button
              className="cart-btn"
              disabled={getStock(selectedProduct._id) === 0}
              onClick={() => addToCart(selectedProduct)}
            >
              {getStock(selectedProduct._id) === 0
                ? "Out of Stock"
                : "Add to Cart"}
            </button>

            <button
              className="wishlist-btn"
              onClick={() => addToWishlist(selectedProduct)}
            >
              ❤️ Wishlist
            </button>

            <button
              className="cancel-btn"
              onClick={() => setSelectedProduct(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="section">
        <h2 className="wishlist-title">Wishlist ❤️</h2>
        <h3 className="wishlist-count">Wishlist Items: {wishlist.length}</h3>

        {wishlist.length === 0 ? (
          <p className="empty-wishlist">Your wishlist is empty</p>
        ) : (
          <div className="wishlist-list">
            {wishlist.map((item) => (
              <div className="wishlist-item" key={item._id}>
                <img
                  src={item.image}
                  alt={item.name}
                  className="wishlist-image"
                />

                <div>
                  <h3>{item.name}</h3>
                  <p>Price: ₹{item.new_price}</p>
                  <p>Stock: {getStock(item._id)}</p>
                </div>

                <button
                  className="cart-btn"
                  disabled={getStock(item._id) === 0}
                  onClick={() => addToCart(item)}
                >
                  {getStock(item._id) === 0 ? "Out of Stock" : "Add to Cart"}
                </button>

                <button
                  className="delete-btn"
                  onClick={() => removeFromWishlist(item._id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="section">
        <h2 className="cart-title">Cart</h2>
        <h3 className="cart-count">Cart Items: {totalItems}</h3>

        {cart.length === 0 ? (
          <p className="empty-cart">Your cart is empty</p>
        ) : (
          <>
            <div className="cart-list">
              {cart.map((item) => (
                <div className="cart-item" key={item._id}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-image"
                  />

                  <div>
                    <h3>{item.name}</h3>
                    <p>Price: ₹{item.new_price}</p>
                    <p>Available Stock: {getStock(item._id)}</p>
                    <p>Subtotal: ₹{Number(item.new_price) * item.quantity}</p>

                    <div className="quantity-box">
                      <button
                        className="qty-btn"
                        onClick={() => decreaseQuantity(item._id)}
                      >
                        -
                      </button>

                      <span className="qty-text">{item.quantity}</span>

                      <button
                        className="qty-btn"
                        onClick={() => increaseQuantity(item._id)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    className="delete-btn"
                    onClick={() => removeFromCart(item._id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <h2 className="total-amount">Total Amount: ₹{totalAmount}</h2>

            <input
              type="text"
              placeholder="Enter Coupon Code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
            />

            <button className="coupon-btn" onClick={applyCoupon}>
              Apply Coupon
            </button>

            <h3>Discount: ₹{discount}</h3>
            <h2 className="total-amount">Final Amount: ₹{finalAmount}</h2>

            <h3>Payment Method</h3>

            <select
              className="sort-box"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="Cash on Delivery">Cash on Delivery</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Net Banking">Net Banking</option>
            </select>

            <button className="checkout-btn" onClick={handleCheckout}>
              {paymentMethod === "Cash on Delivery"
                ? "Place Order"
                : "Pay Now"}
            </button>
          </>
        )}
      </div>

      <div className="section">
        <h2>📦 Order History</h2>

        {orders.length === 0 ? (
          <p>No orders yet</p>
        ) : (
          orders.map((order, index) => (
            <div key={order.id} className="order-card">
              <h3>Order #{index + 1}</h3>

              <p className="order-status">
                {order.status === "Delivered"
                  ? "🟢 Delivered"
                  : order.status === "Shipped"
                  ? "🔵 Shipped"
                  : "🟡 Order Placed"}
              </p>

              <p>Payment Method: {order.paymentMethod || "Cash on Delivery"}</p>
              <p>Payment Status: {order.paymentStatus || "Pending"}</p>

              <div className="button-group">
                <button
                  className="cart-btn"
                  onClick={() => updateOrderStatus(order.id, "Shipped")}
                >
                  Mark as Shipped
                </button>

                <button
                  className="checkout-btn"
                  onClick={() => updateOrderStatus(order.id, "Delivered")}
                >
                  Mark as Delivered
                </button>
              </div>

              {order.items.map((item) => (
                <p key={item._id}>
                  {item.name} × {item.quantity}
                </p>
              ))}

              <h3>Total: ₹{order.total}</h3>
            </div>
          ))
        )}
      </div>

      <div className="section">
        <AddProduct refreshProducts={fetchProducts} />
      </div>

      <div className="section">
        <h2>Product List</h2>

        <input
          className="search-box"
          type="text"
          placeholder="Search product by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="sort-box"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="Default">Default Sorting</option>
          <option value="LowToHigh">Price: Low to High</option>
          <option value="HighToLow">Price: High to Low</option>
        </select>

        <div className="category-buttons">
          {categories.map((cat) => (
            <button
              key={cat}
              className={categoryFilter === cat ? "active-btn" : ""}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <h3 className="count">Total Products: {filteredProducts.length}</h3>

        <div className="product-grid">
          {filteredProducts.map((product) => (
            <div className="product-card" key={product._id}>
              {editingId === product._id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />

                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                  />

                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                  />

                  <input
                    type="text"
                    placeholder="Image URL"
                    value={editImage}
                    onChange={(e) => setEditImage(e.target.value)}
                  />

                  <div className="button-group">
                    <button
                      className="save-btn"
                      onClick={() => handleUpdate(product._id)}
                    >
                      Save
                    </button>

                    <button
                      className="cancel-btn"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {product.image && product.image.trim() !== "" ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-image"
                    />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}

                  <h3>{product.name}</h3>
                  <p>Price: ₹{product.new_price}</p>
                  <p>Category: {product.category}</p>

                  <p
                    className={
                      getStock(product._id) === 0 ? "out-stock" : "in-stock"
                    }
                  >
                    {getStock(product._id) === 0
                      ? "Out of Stock ❌"
                      : `In Stock ✅ (${getStock(product._id)})`}
                  </p>

                  <div className="rating-box">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={
                          star <= (ratings[product._id] || 0)
                            ? "star filled"
                            : "star"
                        }
                        onClick={() => handleRating(product._id, star)}
                      >
                        ★
                      </span>
                    ))}

                    <p className="rating-text">
                      Rating: {ratings[product._id] || 0}/5
                    </p>
                  </div>

                  <div className="review-box">
                    <input
                      type="text"
                      placeholder="Write a review"
                      value={reviewInputs[product._id] || ""}
                      onChange={(e) =>
                        setReviewInputs({
                          ...reviewInputs,
                          [product._id]: e.target.value,
                        })
                      }
                    />

                    <button
                      className="review-btn"
                      onClick={() => addReview(product._id)}
                    >
                      Add Review
                    </button>

                    {(reviews[product._id] || []).map((review, index) => (
                      <p className="review-text" key={index}>
                        💬 {review}
                      </p>
                    ))}
                  </div>

                  <div className="button-group">
                    <button
                      className="details-btn"
                      onClick={() => setSelectedProduct(product)}
                    >
                      View Details
                    </button>

                    <button
                      className="edit-btn"
                      onClick={() => startEdit(product)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(product._id)}
                    >
                      Delete
                    </button>

                    <button
                      className="cart-btn"
                      disabled={getStock(product._id) === 0}
                      onClick={() => addToCart(product)}
                    >
                      {getStock(product._id) === 0
                        ? "Out of Stock"
                        : "Add to Cart"}
                    </button>

                    <button
                      className="wishlist-btn"
                      onClick={() => addToWishlist(product)}
                    >
                      ❤️ Wishlist
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <footer className="footer">
        <p>ShopSphere © 2026</p>
        <p>Made by Sirisha Reddy</p>
      </footer>
    </div>
  );
}

export default App;