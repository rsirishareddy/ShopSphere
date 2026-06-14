// import axios from "axios";
// import { useState } from "react";

// function AddProduct({ refreshProducts }) {
//   const [name, setName] = useState("");
//   const [price, setPrice] = useState("");
//   const [category, setCategory] = useState("");
//   const [image, setImage] = useState("");

//   async function handleAdd() {
//     console.log("BUTTON CLICKED");

//     try {
//       const res = await axios.post("http://127.0.0.1:4000/addproduct", {
//         name: name,
//         new_price: Number(price),
//         category: category,
//         image: image,
//       });

//       console.log("Product added:", res.data);
//       alert("Product Added Successfully");

//       setName("");
//       setPrice("");
//       setCategory("");
//       setImage("");

//       if (refreshProducts) {
//         refreshProducts();
//       }
//     } catch (error) {
//       console.log("ADD PRODUCT FRONTEND ERROR:", error.response?.data || error);
//       alert("Error adding product");
//     }
//   }

//   return (
//     <div>
//       <h1>Add Product</h1>

//       <input
//         type="text"
//         placeholder="Product Name"
//         value={name}
//         onChange={(e) => setName(e.target.value)}
//       />

//       <input
//         type="number"
//         placeholder="Product Price"
//         value={price}
//         onChange={(e) => setPrice(e.target.value)}
//       />

//       <input
//         type="text"
//         placeholder="Product Category"
//         value={category}
//         onChange={(e) => setCategory(e.target.value)}
//       />

//       <input
//         type="text"
//         placeholder="Image URL"
//         value={image}
//         onChange={(e) => setImage(e.target.value)}
//       />

//       <button type="button" onClick={handleAdd}>
//         Add Product
//       </button>
//     </div>
//   );
// }

// export default AddProduct;
import axios from "axios";
import { useState } from "react";

function AddProduct({ refreshProducts }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");

  async function handleAdd() {
    try {
      const res = await axios.post("http://127.0.0.1:4000/addproduct", {
        name,
        new_price: Number(price),
        category,
        image,
      });

      alert("✅ Product Added Successfully");

      setName("");
      setPrice("");
      setCategory("");
      setImage("");

      refreshProducts && refreshProducts();
    } catch (error) {
      console.log(error);
      alert("❌ Error adding product");
    }
  }

  return (
    <div className="add-product-container">
      <div className="add-product-card">
        <h1>🛍️ Add Product</h1>

        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          placeholder="Product Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <input
          type="text"
          placeholder="Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />

        <button onClick={handleAdd}>
          Add Product
        </button>
      </div>
    </div>
  );
}

export default AddProduct;