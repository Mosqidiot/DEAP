## TODO: Permissions

Switch over to NDA permission system using http digest. The service is currently limited to be accessed from our endpoint system only. The API is availble:

```
http://ec2-52-1-12-173.compute-1.amazonaws.com:32810/swagger-ui.html#/users
```

```
/user
/user/permissiongroup/{permissionGroup}
 
http://ec2-52-1-12-173.compute-1.amazonaws.com:32810/user
 
http://ec2-52-1-12-173.compute-1.amazonaws.com:32810/user/permissiongroup/Adolescent%20Brain%20Cognitive%20Development
```
The returned information is:
```
<HasPermission>
  <permissionGroupTitle>Adolescent Brain Cognitive Development</permissionGroupTitle>
  <hasPermission>true</hasPermission>
  <expirationDate>2018-12-02</expirationDate>
  <status>Approved</status>
</HasPermission>
```