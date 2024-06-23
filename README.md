# Web Application for Hyperledger Fabric

Application Interface is an web application that connects hyperledger fabric blockchain with a web application. It has multiple users that can approve an application. It also shows the list of approved application from the world state of DLT(distributed ledger technology).

## Installation
Clone the repository:

    git clone https://github.com/Rakib-mbstu/application-interface-
    cd application-interface-
Install the dependencies:

    npm install
   
To start the development server, run:

    npx nodemon app.js || node app.js

## Project Structure

application-interface-  
├── app.js  
├── package.json  
├── node_modules  
├── views    
├── router  
├── server


## How to use
- Create a test network using [hyperledger test network](https://hyperledger-fabric.readthedocs.io/en/release-2.5/test_network.html)
- Install  [chaincode](https://github.com/Rakib-mbstu/chaincode-tradeLicense)
- Run the application
- Add the licensing path to the db using API(/addPath)
## License

[MIT](https://choosealicense.com/licenses/mit/)