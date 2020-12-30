# IntercoinContract
System for Deploying Intercoin Smart Contracts, Factories and Instances

# Installation

## Node
`npm install @openzeppelin/contracts-ethereum-package`

# Deploy

when deploy it is no need to pass parameters in to constructor

# Overview

Once installed will be use methods:

<table>
<thead>
	<tr>
		<th>method name</th>
		<th>called by</th>
		<th>description</th>
	</tr>
</thead>
<tbody>
    <tr>
        <td colspan="3" align="center">IntercoinContract.sol</td>
    </tr>
	<tr>
		<td><a href="#init">init</a></td>
		<td>owner</td>
		<td>initializing after deploy</td>
	</tr>
	<tr>
		<td><a href="#producefactory">produceFactory</a></td>
		<td>owner</td>
		<td>creating factory possible to create contract instance</td>
	</tr>
	<tr>
		<td><a href="#registerinstance">registerInstance</a></td>
		<td>only factories created by IntercoinContract</td>
		<td>registering contracts created by factories</td>
	</tr>
	<tr>
		<td><a href="#checkinstance">checkInstance</a></td>
		<td>anyone</td>
		<td>checking contracts created by factory</td>
	</tr>
	<tr>
		<td><a href="#renounceownership">renounceOwnership</a></td>
		<td>owner</td>
		<td>
		Leaves the contract without owner.<br>
		It will not be possible to call `onlyOwner` functions anymore.
        </td>
	</tr>
    <tr>
        <td colspan="3" align="center">Factory.sol</td>
    </tr>
	<tr>
		<td><a href="#init-1">init</a></td>
		<td>owner</td>
		<td>initializing after deploy</td>
	</tr>
	<tr>
		<td><a href="#produce">produce</a></td>
		<td>anyone</td>
		<td>creating contract insance</td>
	</tr>
</tbody>	
</table>

## Methods (IntercoinContract.sol)

#### init
initializing after deploy

#### produceFactory
creating factory possible to create contract instance
Emitted event `ProducedFactory(address addr)`<br>
Params:<br>
name  | type | description
--|--|--
contractInstance|address| contract's address which need to clone

Return Values:<br>
name  | type | description
--|--|--
factoryInstance|address| factory's address

#### registerInstance
Registering contracts creating by factories
Params:<br>
name  | type | description
--|--|--
addr|address[]| address of contract instance 

Return Values:<br>
name  | type | description
--|--|--
success|bool| true if registered successful

#### checkInstance
checking contracts created by factory
Params:<br>
name  | type | description
--|--|--
addr|address[]| address of contract instance 

Return Values:<br>
name  | type | description
--|--|--
success|bool| true if registered successfully before

#### renounceOwnership
Leaves the contract without owner


## Methods (Factory.sol)

#### init
initializing after deploy

#### produce
creating factory possible to create contract instance
Emitted event `Produced(address indexed caller, address indexed addr)`<br>
Return Values:<br>
name  | type | description
--|--|--
addr|address| contract's address



## Lifecycle
1.	owner deploy contract which need to be cloned. got `contract address`
2.	owner deploy IntercoinContract and call method init()
3.	create factory
	* owner call method produceFactory(<`contract address`>) at IntercoinContract. 
	* emitted event ProducedFactory(<`factory address`>)
4.  creating contract 
    * anyone can call method produce() at newly created factory
    * emitted event Produce(<`contract address`>)
5.	now user can call init  at newly created contract and would to be owner 
