import { useEffect, useState } from "react";
import axios from "axios";

function ViewProducts(){

const [products,setProducts]=useState([]);

useEffect(()=>{

axios.get("http://localhost:4000/allproducts")
.then((res)=>{
setProducts(res.data);
});

},[]);

async function deleteProduct(index){

await axios.delete(
`http://localhost:4000/deleteproduct/${index}`
);

alert("Product Deleted");

window.location.reload();

}

return(

<div>

<h1>All Products 🛒</h1>

<div style={{
display:"flex",
gap:"20px",
flexWrap:"wrap",
justifyContent:"center"
}}>

{products.map((item,index)=>(

<div key={index} style={{
border:"1px solid white",
padding:"20px",
width:"220px",
borderRadius:"10px"
}}>

<h2>{item.name}</h2>

<p>Category: {item.category}</p>

<h3>₹{item.new_price}</h3>

<button>
Add to Cart
</button>

<button onClick={()=>deleteProduct(index)}>
Delete
</button>

</div>

))}

</div>

</div>

)

}

export default ViewProducts;