import axios from "axios";
import { useEffect, useState } from "react";

function ProductList() {
  const [products, setProducts] = useState([]);

  async function getProducts() {
    try {
      const res = await axios.get("http://localhost:4000/products");
      setProducts(res.data);
    } catch (error) {
      console.log(error);
      alert("Error fetching products");
    }
  }

  async function deleteProduct(id) {
    try {
      await axios.delete(`http://localhost:4000/deleteproduct/${id}`);
      alert("Product Deleted");
      getProducts();
    } catch (error) {
      console.log(error);
      alert("Error deleting product");
    }
  }

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <div>
      <h1>Products</h1>

      {products.map((product) => (
        <div key={product._id}>
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              width="150"
              height="150"
              style={{ objectFit: "cover" }}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "block";
              }}
            />
          ) : null}

          <p style={{ display: product.image ? "none" : "block" }}>
            No Image Found
          </p>

          <h3>{product.name}</h3>
          <p>Price: ₹{product.new_price}</p>
          <p>Category: {product.category}</p>

          <button onClick={() => deleteProduct(product._id)}>Delete</button>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default ProductList;