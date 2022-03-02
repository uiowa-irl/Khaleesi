Below we describe the features used in Khaleesi:

## Sequential features

1. **Average probability of the previous predictions:** Average classification probability in prior classifications.
2. **Probability of the previous prediction:** Classification probability in the previous classification. 
3. **Length of the chain:** Count of the number of requests that appear in a request chain.
4. **Consecutive requests to the same domain:** Count of the number of requests in the chain that follow each other to the same domain.
5. **Number of unique domains in the chain:** Count of the number of unique domains that appear in a request chain.



## Response features

1. **Content length:** Count of characters returned in content.  
2. **P3P in response header :** Checks for the presence of P3P property in the response headers.
3. **Content sub-type:** Captures the subtype of Content-Type (Content-Type=type/subtype) property of the response header (e.g. png). 
4. **Status code:** HTTP Status code returned by the response (e.g. 200, 302, 404).
5. **ETag in response header:** Checks for the presence of ETag property in the response headers.
6. **Whether the response sets a cookie:** Checks whether the response returns a cookie to be set.
7. **Content type:** Captures the type of Content-Type (Content-Type=type/subtype) property of the response header (e.g. image). 
8. **Number of response headers:** Count of properties returned in the response header.



## Request features

1. **Third-party:** Whether the request is directed to a third party.  
2. **Length of the query string:** Count of characters in the query string.
3. **Ad/tracking keywords in URL:** Whether the URL contains common advertising and tracking keywords (e.g. pixel, track). 
4. **Ad/tracking keywords in URL surrounded by special char:** Whether the URL contains common advertising and tracking keywords that are surrounded by alphanumeric characters. 
5. **Number of special characters in query string:** Count of alphanumeric characters in the query string. 
6. **Length of the URL:** Count of characters in the URL.
7. **Subdomain check:** Whether the hostname has a subdomain.
8. **Accept type:** Captures the MIME type, determined by the Content-Type header (e.g. image, script).
9. **Subdomain of the top-level domain check:** Whether the hostname is a subdomain of the top-level document's domain.
10. **Top-level domain in query string:** Whether the top level domain appears in the query string.
11. **Number of cookies in request:** Count of cookies sent in a request.
12. **UUID in URL:** Presence of a UUID pattern (........-....-....-....-............) in a URL.
13. **Number of request headers:** Count of properties sent in the request header.
14. **Request method:** Whether the request is sent through GET or POST method. 
15. **Semicolon in query string:** Whether the query string contains semicolon. 
