const fs = require('fs');
// fs is for file system
const http = require('http');
const url = require('url');
const slugify = require('slugify');
const replaceTemplate = require('./modules/replaceTemplate');

/////////////////////////////////
// FILES

// Blocking, synchronous way
// executed line by line
const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
console.log(textIn);
const textOut = `This is what we know about the avocado: ${textIn}.\nCreated on ${Date.now()}`;
fs.writeFileSync('./txt/output.txt', textOut);
console.log('File written!');

// Non-blocking, asynchronous way
fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
   //data1 print after printing will read file and printing 'Listening to requests on port 8000
  // bcz this is call-back function callled after all line of code this file were executed therefor it is called Non-blocking  
  console.log(data1)
  if (err) return console.log('ERROR! 💥');

  fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
    console.log(data2);
    // then after data1, data2 is print
    fs.readFile('./txt/append.txt', 'utf-8', (err, data3) => {
      console.log(data3);
        // after data2, data3 is print.
      fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', err => {
        console.log('Your file has been written 😁');
      })
    });
  });
});
//so it means below code run before run the code of above code bcz it is non-blocking code
console.log('Will read file!');
/////////////////////////////////
// SERVER
// arrow function does not have its own this keyword it use this keyword of that parents.so in arrow function we couldn't define any variable inside arrow function
// where normal function have its own this keyword
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf-8'
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf-8'
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf-8'
);

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

const slugs = dataObj.map(item => slugify(item.productName, { lower: true }));
console.log(slugs);

const server = http.createServer((req, res) => {
  // in this this error fuction is call-back function
  console.log('server created')
  console.log('req',req)
  console.log('req urls',req.url)
  // console.log('res',res)
  // res.end('hellow from the server')
  // const pathName=req.url
  // 
  const { query, pathname } = url.parse(req.url, true);

  // Overview page
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, {
      'Content-type': 'text/html'
    });
    // res.end(tempOverview)
    const cardsHtml = dataObj.map(item => replaceTemplate(tempCard, item)).join('');
    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
    res.end(output);

    // Product page
  } else if (pathname === '/product') {
    res.writeHead(200, {
      'Content-type': 'text/html'
    });
    const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product);
    res.end(output);

    // API
  } else if (pathname === '/api') {
    // fs.readFile('./dev-data/data.json','utf-8',(err,data)=>{
      // const productData=JSON.parse(data)
      // console.log(productData)
    // });
    // res.end('api')
    res.writeHead(200, {
      'Content-type': 'application/json'
    });
    res.end(data);

    // Not found
  } else {
    res.writeHead(404, {
      'Content-type': 'text/html',
      'my-own-header': 'hello-world'
    });
    res.end('<h1>Page not found!</h1>');
  }
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to requests on port 8000');
});
console.log('code is complete')