const {MongoClient, ConnectionPoolClosedEvent} = require('mongodb');
const ValidatorMan = require('./ValidatorMan');
require('dotenv').config()
/**     
 * Class representing a wrapper using MongoClient.<br>
 * method is asynchrone, much return a promise than you can manage with async/await OR with .then()
 */
class MongoMan{
    /**
     * @param {string} dbConnection - represent the db connection endpoints (by default is come from .env a variable name DB_CONNECT )
     * @param {string} dbName - represent the Db name (by default is come from .env a variable name DB_NAME)
     * @default [process.env.DB_CONNECT,process.env.DB_NAME] 
     */
    #client
    #dbName
    constructor(dbConnection=process.env.DB_CONNECT,dbName=process.env.DB_NAME){
    this.#client = new MongoClient(dbConnection);
    this.#dbName = dbName
    }

async #getCo(collection){
    await this.#client.connect();//made the connection 
        return this.#client.db(this.#dbName).collection(collection);//return the connection with the collection target 
}

/**method to insert one document to a collection
 * @param {string} collection -the name of wish collection you wanna delete in your database WARNING it will delete the collection and all documents associated
 * @throws {TypeError|serverMongoError} - if the metrhod didn't match the collection it will return serverMongoError "ns not found" 
 * @returns {true}
 */
async documentDelete(collection){
        ValidatorMan.collectionValidation(collection)
        await this.#client.connect();
        await this.#client.db(this.#dbName).dropCollection(collection)
        this.#client.close()
        return true
}
/**method to insert one document to a collection
 * @param {string} collection -the name of wish collection  you wanna add your document can exist or not (the collection will be create)
 * @param {object} data - represent the document json to insert
 * @throws {TypeError}
 * @returns {true}
 */
async insertOne(collection,data)
{
        ValidatorMan.collectionValidation(collection)
        ValidatorMan.dataValidation(data)
        let collect = await this.#getCo(collection);
        await collect.insertOne(data)
        this.#client.close()
        return true
}
/**method to insert multiple documents to a collection
 * 
 * @param {string} collection -the name of wish collection  you wanna add your document can exist or not (the collection will be create)
 * @param {Array<object>} arr - represent a array of objects representing each the document json to insert
 * @throws {TypeError} throw an error if the type of argument collection is not a string OR argument arr is not a array
 * @returns {true}
 */
async insertMany(collection,arr)
{   
        ValidatorMan.collectionValidation(collection)
        ValidatorMan.arrDataValidation(arr)
        let collect = await this.#getCo(collection)
        await collect.insertMany(arr);//execute the query
        this.#client.close()
        return true  
}
///TODO refact below point and rewrite unit test 
/**method to find One document from a collection
 * 
 * @param {string} collection -the name of target collection where you can find the document
 * @param {object} query - a object represent the query of your request 
 * @param {object} [options] - if you wanna specify optionnal options to your request
 * @throws {InvalidArgumentException} throw an error if the type of argument collection is not a string OR argument query is not a object OR argument options is present and isn't a object
 * @returns {promise<object>} - object of your request
 */
async findByOne(collection,query,options){
 
        ValidatorMan.collectionValidation(collection)
        ValidatorMan.queryValidation(query)
        ValidatorMan.optionsValidation(options)
  
        let collect = await this.#getCo(collection);
        let result = await collect.findOne(query,options)
        result = (result === null)?function(){throw new Error (`can find any result on your request, check twice pls your collection name and query object`)}():result;
        return result
  
}
//TODO add possibilites to retrieve a object of objects instead of a array 
/**method to find Multiple documents from a collection
 * 
 * @param {string} collection -the name of target collection where you can find the documents
 * @param {object} query - a object represent the query of your request 
 * @param {object} [options] - if you wanna specify optionnal options to your request
 * @throws {InvalidArgumentException} throw an error if the type of argument collection is not a string OR argument query is not a object OR argument options is present and isn't a object
 * @returns {promise<array<object>>} - a array of objects of your request
 */
async findMulti(collection,query,options){
    
        ValidatorMan.collectionValidation(collection)
        ValidatorMan.queryValidation(query)
        ValidatorMan.optionsValidation(options)
        
        let collect = await this.#getCo(collection);
        let cursor = collect.find(query,options)
        let many = await cursor.count();
        (many>0)? many:function(){throw new Error(`we did not find any documents`)}();
        return cursor.toArray()

}
///
///
/**method to delete one document from a collection
 * 
 * @param {string} collection -the name of target collection where you wanna delete the document
 * @param {object} data - a object represent the query of your request 
 * @param {object} [options] - if you wanna specify optionnal options to your request
 * @throws {InvalidArgumentException} throw an error if the type of argument collection is not a string OR argument query is not a object OR argument options is present and isn't a object
 * @throws {ProcessError} throw an error if the request fail 
 * @returns {string} - a sucess message 
 */
async deleteOne(collection,query,options){
    
        ValidatorMan.collectionValidation(collection)
        ValidatorMan.queryValidation(query)
        ValidatorMan.optionsValidation(options)

        let collect = await this.#getCo(collection)
        collect.deleteOne(query,options)
       
        return "success you have deleted 1 document";
  
}
///
/**method to delete many documents from a collection
 * 
 * @param {string} collection -the name of target collection where you wanna delete the documents
 * @param {object} data - a object represent the query of your request if is EMPTY object it will deleted all documents in the collections
 * @param {object} [options] - if you wanna specify optionnal options to your request
 * @throws {InvalidArgumentException} throw an error if the type of argument collection is not a string OR argument query is not a object OR argument options is present and isn't a object
 * @throws {ProcessError} throw an error if the request fail 
 * @returns {string} - a sucess message 
 */
async deleteMany(collection,query,options){
  
        ValidatorMan.collectionValidation(collection)
        ValidatorMan.queryValidation(query)
        ValidatorMan.optionsValidation(options)

        let collect = await this.#getCo(collection)
        let result = await collect.deleteMany(query,options)

        //TODO refacto to ternairy condition return 
        if(result.deletedCount === 1){
            return"you have only 1 document match you query it be deleted";
        }
        else if (result.deletedCount > 1 ){
            return`deleted count : ${result.deletedCount}`;
        }
        else{
            throw `a error occured you didn't delete any document`
        }
}
}
module.exports = MongoMan;
