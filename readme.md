[BeagleBone Home Automation](https://github.com/u1tralord/Beaglebone-Home-Automation)
======

A NodeJS module built to act a modular and simple to use home automation program for the 
BeagleBone Black, but can be used on any platform with NodeJs installed.

### Install
To Install, navigate to a directory and run the following commands:  
*Note: This will create a new directory to store this repository*

```
~$: git clone https://github.com/u1tralord/Beaglebone-Home-Automation.git  
~$: cd Beaglebone-Home-Automation  
~$: npm install  
```

### Configure
Use the config_generator.js to generate all necessary config files. Configuration values can be set within the generator or feel free to manually edit all of the individual config files. (All config files are formatted as JSON)  

*Note: Sensitive data, such as passwords and API keys should be stored in account_info.json (not provided) in order to keep private information off of Github*  

From the root directory, run the following command to generate all config files
```
~$: node config_generator.js  
```

### Use
Run the following command to start the server.  
```
~$: node Server.js  
```