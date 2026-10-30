# AUTH FLOWS

---

## CREATE ACCOUNT FUNCTION

* CONTROLLER AUTHCONTROLLEER 

```mermaid
flowchart TD
    Start([Start]) --> SessionCode[using helperTools create session code]
    SessionCode --> HashPwd[using helperCrypto hash password]
    HashPwd --> CreateDB[create new register on DB and get new UID created to new user]
    CreateDB --> SuccessCode[make standard response with success code OK0001]
    SuccessCode --> Return200[return response with status code 200]
    Return200 --> End([End])
```

[> [!IMPORTANT]
> in that flow for create account you should create 2 endpoints one public that when try to create user should assign role with public code: RCPU and other endpoint private in where request should has role to asign when create user]

## SIGNING FUCNTION

* CONTROLLER AUTHCONTROLLEER

```mermaid
flowchart TD
    Start([Start]) --> GetDBUser[Go to DB and get user data filter by userSessionCode and idUserStatus in 1,2 and userCountryISO = request countryISO]
    GetDBUser --> CheckLen{length result > 0?}
    
    CheckLen -- No --> Unauth1[Make standard response with status code 401, unauthorized, and with error message AUTH0001]
    Unauth1 --> RetErr1[Return response with error]
    RetErr1 --> End([End])
    
    CheckLen -- Yes --> Retry15{sessionRetryCount > 15 && DateTimeNow - lastSessionRetry < 15 minutes}
    
    Retry15 -- Yes --> Retry30{sessionRetryCount > 30 && DateTimeNow - lastSessionRetry < 15 minutes}
    Retry15 -- No --> ComparePwd[Using helperCrypto compare request password vs hashed DB password and save on a variable true/false]
    
    Retry30 -- Yes --> SetStatus3[Go to DB and set filtred by userSessionCode set idUserStatus = 3 BANNED]
    SetStatus3 --> Err429A[Make response with status code 429 too many request, with error code AUTH0002]
    Err429A --> RetErr2[Return response with error]
    RetErr2 --> End
    
    Retry30 -- No --> IncRetry1[Go to DB and set filtred by userSessionCode set sessionRetryCount += 1]
    IncRetry1 --> Err429B[Make response with status code 429 too many request, with error code AUTH0003]
    Err429B --> RetErr3[Return response with error]
    RetErr3 --> End
    
    ComparePwd --> PwdValid{Password is valid?}
    
    PwdValid -- No --> IncRetry2[Go to DB and set filtred by userSessionCode set sessionRetryCount += 1]
    IncRetry2 --> Unauth2[Make response with status code 401 Unauthorized, with error code AUTH0001]
    Unauth2 --> RetErr4[Return response with error]
    RetErr4 --> End
    
    PwdValid -- Yes --> GenJWT[using helperCrypto to make signed JWT, refresh token, and expired time of refresh token and returns three values]
    GenJWT --> ResetRetry[Go to DB and set filtred by userSessionCode set sessionRetryCount = 0]
    ResetRetry --> UpdateSession[Go to DB and upsert table UserSession set refreshToken with generated refresh token and also set refreshTokenExpire = expired time from helper at the end set isActive = true/1 for the user behind the request user session code]
    UpdateSession --> SuccessOK0002[make standard response with status code 200 and success message code OK0002]
    SuccessOK0002 --> RetSuccess[return success response]
    RetSuccess --> End
```

## VALIDATE SESSION FUNCTION

* FUNCTION TO BE AN DECORATOR FOR ENDPOINTS

```mermaid
flowchart TD
    Start([Start]) --> ValJWT[using helperCrypto validate JWT sign and if that is expired and return bool per validation]
    ValJWT --> JWTValid{JWT sign is correct?}
    
    JWTValid -- No --> ErrorAUTH0004[make standard response with status code 403 forbbiden with error code AUTH0004]
    ErrorAUTH0004 --> RetError1[return error response]
    RetError1 --> End([End])
    
    JWTValid -- Yes --> JWTExpired{JWT is expired?}
    
    JWTExpired -- Yes --> DBCheck1[Go to DB and get from table UserSession values refreshTokenExpire, isActive filtred by refreshToken equals refresh token request.]
    DBCheck1 --> IsActive1{isActive?}
    IsActive1 -- No --> ErrorAUTH0005[make standard response with status code 403 forbbiden with error code AUTH0005]
    ErrorAUTH0005 --> RetError2[return error response]
    RetError2 --> End
    IsActive1 -- Yes --> ExpireCheck{refreshTokenExpire - currentDateTime > 0?}
    ExpireCheck -- No --> ErrorAUTH0006[make standard response with status code 403 forbbiden with error code AUTH0006]
    ErrorAUTH0006 --> RetError3[return error response]
    RetError3 --> End
    ExpireCheck -- Yes --> HelperCrypto2[using helperCrypto to make signed JWT and refresh token don't use expired time that helper returns only update refreshToken]
    HelperCrypto2 --> DBUpdate1[Go to DB and update table UserSession set refreshToken with generated refresh token where refreshToken = request refresh token]
    DBUpdate1 --> SuccessOK0002[make standard response with status code 200 and success message code OK0002]
    SuccessOK0002 --> RetSuccess1[return success response]
    RetSuccess1 --> End

    JWTExpired -- No --> SuccessOK0003[make standard response with status code 200 and success message code OK0003, nothing is renewed]
    SuccessOK0003 --> RetSuccess2[return success response]
    RetSuccess2 --> End
```


## VALIDATE ROLE FUNCTION

* FUNCTION TO BE AN DECORATOR FOR ENDPOINTS

```mermaid
flowchart TD
    Start([Start]) --> CacheDB[go to cache DB and filter by role from JWT endpoints]
    CacheDB --> CheckEndpoint{endpoint request exist on role permission?}
    CheckEndpoint -- Yes --> SuccessCode[make standard response with status code 200 and success without message]
    SuccessCode --> ReturnSuccess[return success response]
    ReturnSuccess --> End([End])
    CheckEndpoint -- No --> ErrorCode[make standard response with status code 403 forbbiden with error code AUTH0007]
    ErrorCode --> ReturnError[return error response]
    ReturnError --> End
```


### FUNCTIONS FEATURES

* Adapt that flows with existing database if some column doesn't exist adapt flows to don't use it, you should use strictly current DB
* You should make DTOs by your criteria and known of tables
* Your criteria should validate request before using middleware to validate if password length is correct, email has correct format, etc. If some is wrong before entry flow should response with status 400 and as messageError for standard DTO, you should send error as unique string separated for | indicating what is wrong with request
* on create account you should create an session code A-Z a-z code and save it on DB
* for encrypt and validate password, use Argon 2 with salt if needs some secret key should live on appsettings.json
* for JWT you should use standard signed library for JWT on AOT .NET 10, secret key to sign JWT should be stay on env file, remember env should be injected using ISettings

### MESSAGE ERROR AND SUCCESS BY CODE

* OK0001: Cuenta creada con exito
* OK0002: Sesion iniciada con exito
* OK0003: Su sesion sigue siendo valida
* AUTH0001: El usuario o contrasenia no son correctos por favor valide nuevamente
* AUTH0002: Han sido demasiados intentos su usuario ha sido bloqueado por temas de prevencion sobre ataques de fuerza bruta
* AUTH0003: Ha reintentado muchas veces en un corto periodo de tiempo, su usuario ha sido bloqueado temporalmente por prevencion no siga intentando en los proximos 15 mins o sera bloqueado permanentemente
* AUTH0004: Token malformado por favor inicie sesion nuevamente para continuar
* AUTH0005: Sesion invalida por favor inicie sesion nuevamente
* AUTH0006: Su sesion ha expirado por favor inicie sesion nuevamente
* AUTH0007: Su usuario no cuenta con los permisos necesarios

[> [!IMPORTANT]
> now i don't see swagger functional, you should solve it and put swagger to when i put on browser localhost:3000/swagger i can see swagger
> you should addapt that flows to can be used on my API and create decorator to use validate session
> if Session is refresh you should add to data from standard response an new key called refreshSession and return new refreshToken and token signed to rotate session]
