
# FEATURES FOR USER ADMIN

---

## ENDPOINT TO CREATE A NEW PRODUCT

### ENDPOINT INFO

* path: /api/admin/product
* method: POST
* request json DTO

```json
// Variant DTO
{
  "SKU": "string", // should be required
  "size": "string", // could be null
  "color": "string", // could be null 
  "features": "string", // could be null
  "price": "decimal(18,2)", // should be required
  "quantity": "int", // should be required and should be >= 0
  "isDefault": "bool" // in list it must be a least one with this flag as true and only one of list can be true, if all is false should throw an 400 bad request indicating that flag
  "photos": "photosDTO[]" // could be empty array, but must be a least one with an array length > 1 if all is empty array should throw an 400 bad request indicating that flag
}
// Photos DTO
{
  "fileName": "string", // is required
  "s3BucketKey": "string", // is required
  "fileContentType": "string" // is required
}
//new product DTO
{
  "productName": "string", // is required
  "productDescription": "string", // is required
  "productPublicCode": "string", // is required 
  "variants": "variantDTO[]" // must be length > 0
}
```

* response should be data: null, in message should be AUTH OK0004: "Registro creado correctamente"

### ENDPOINT BEHAVIOR

* you should create a new register for tables Product, ProductVariant, StoredFile
* first create Product, using his id you should create ProductVariant and per Id of ProductVariant you should create StoredFiles

### ENDPOINT RESTRICTIONS

* that should be an high performance endpoint should do process in less than 500 ms

## ENDPOINT TO GET PRE SIGNED S3 BUCKET URL

### ENDPOINT INFO

* path: /api/admin/stored-file
* method: POST
* request json:
* message: "Urls generadas correctamente"

```json
// file key DTO
{
  "fileName": "string", // should be required
  "fileKey": "string", // should be required
  "fileContentType": "string" // should be required
}

// request DTO
{
  "files": "fileDTO[]" // must be length > 0
}
```

* response json:

```json
// pre signed URL DTO
{
  "fileName": "string",
  "fileKey": "string",
  "filePresignedUrl": "string"
}

// response of endpoint for standard response

{
  "filesUrl": "preSignedUrlDTO[]",
  "expiration": "Datetime"
}
```

### ENDPOINT BEHAVIOR

* should receive information of files to create s3 pre signed URL per file

### ENDPOINT RESTRICTIONS

* should has expired time configurated on .env file for now 15 minutes
* should be an endpoint with high performace less than 500 ms per call

## ENDPOINT TO GET PRODUCT LIST

### ENDPOINT INFO

* path: /api/common/product
* method: GET
* request query params:

```json
{
  "pageNumber": "int", // default 1
  "pageSize": "int", // default 20
  "idProductType": "int", // optional
  "productName": "string", // optional
  "priceFrom": "decimal(18,2)", // optional
  "priceTo": "decimal(18,2)", // optional
  "from": "dateTime", //optional
  "to": "dateTime" //optional
}
```

### ENDPOINT BEHAVIOR

* What i need endpoints returns
  * I need list of product with list of variants per product
  * Also i need all storedFiles per variant product but for it table only need FileBucketKey column per product variant
  * It's very important if some variant of product don't has storedFiles, you should look what is default product and put his photos for that variant
  * that should be an pagginated endpoint, i mean you should pagginate table for get in order desc from created At



### ENDPOINT RESTRICTIONS

* it should get's id and other important columns without audit columns
* you should do data transformation to convert from tables to an unique DTO for response
* from to should filter by created At to get results
* priceFrom priceTo should be filter by variant Price < >  using that operators to return results in that range of prices


## ENDPOINT TO GET CATALOG

### ENDPOINT INFO

* path: /api/common/catalog
* method: GET 
* request json DTO, only use Role from JWT
* response json DTO for standard response

```json

// CAT DTO
{
  "id": "int",
  "name": "string",
  "description": "string"
}

// response for standard response
{
  "TableNameOfCat1": "CatDTO[]",
  "TableNameOfCatN": "CatDTO[]"
}
```

### ENDPOINT BEHAVIOR

* First of all you should load tables: CatCuponType, CatProductType, CatReverseReason, CatShippmentMethod, CatShippmentStatus, Role on cache when project start to use it for role, for role Admin i need CatProductType, CatCuponType and Role as catalog, but with that i need id be RolePublicCode not id and RoleName be name use also RoleDescription only for this Role. For Operator i only need CatShippmentStatus, and for Client i need CatReverseReason, CatShippmentMethod;
* when invokes endpoint you should get role or roles from JWT and returns catalogs for that from cache

### ENDPOINT RESTRICTIONS

* for now that not has restrictions

## ENDPOINT TO GET IMAGE FORM S3

### ENDPOINT INFO

* path: /api/common/file
* method: GET
* request query params: imageBucketKey, contentType

### ENDPOINT BEHAVIOR

* Endpoint's should go to s3 bucket and using imageBucketKey should get image located on it
* should get image to show on frontend

### ENDPOINT RESTRICTIONS

* should be an ultra high performance endpoint less than 30ms
* in case image don't found should returns an empty file using contentType


## ENDPOINT UPDATE PRODUCT BEHAVIOR SPECIAL

* should has an endpoint special to get all product data with including variants and photos filtering by idProduct as mandatory, and endpoint to update should do next:
  * Update Product table information if that was updated
  * Update variants information if was updated, and if add new variant should add new variant, if some variant was elimiated from origin should be put rowStatus = 0
  * If some stored file was eliminated should eliminate register form data base because it don't is FK, if has new stored file should add it for DB 


## ENDPOINTS CRUD

* An endpoint to delete an product (put rowStatus = 0 also his product variant)
* An endpoint to inactivate an user (to signing endpoint should filter by isActive = 1 to this feature be correct)
* An completed CRUD for table Cupons should make for me all endpoints to be an CRUD for this table
* Complete endpoints to make an completed CRUD for table CatProductType

[> [!IMPORTANT]
> all get endpoint should be has filter as mandatory per rowStatus if table has it
> for other endpoint to complete CRUD Product should be on api/admin/endpoint
> you should invent DTO aprpiate for new endpoints
> all others endpoints should be on api/admin/endpoint
> admin endpoints should has validation for role to can be used so you should create an script to insert it on table]

