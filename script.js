let token="";

/* REGISTER */
async function register(){
  await fetch("http://localhost:5000/register",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      username:document.getElementById("user").value,
      email:document.getElementById("email").value,
      password:document.getElementById("pass").value
    })
  });

  alert("Registered");
  window.location="login.html";
}

/* LOGIN */
async function login(){
  const res = await fetch("http://localhost:5000/login",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      email:document.getElementById("email").value,
      password:document.getElementById("pass").value
    })
  });

  const data = await res.json();

  if(data.token){
    token=data.token;
    localStorage.setItem("token",token);
    window.location="bmi.html";
  }
}

/* BMI */
async function calculateBMI(){

  const h=document.getElementById("height").value;
  const w=document.getElementById("weight").value;

  const token=localStorage.getItem("token");

  const res=await fetch("http://localhost:5000/bmi",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":token
    },
    body:JSON.stringify({height:h,weight:w})
  });

  const data=await res.json();

  document.getElementById("result").innerHTML=`
    <h3>BMI: ${data.bmi.toFixed(2)}</h3>
    <p>${data.category}</p>
    <p>${data.advice}</p>
    <p>Eat: ${data.eat}</p>
    <p>Avoid: ${data.avoid}</p>
  `;
}