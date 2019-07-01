# ThreeSixty

ThreeSixty is designed to be a minimal 360° feedback tool for engineering teams
and managers. It stands on the shoulders of Google App Suite and relies on those
to do all of its heavy lifting:

 - Using google forms to collect feedback data
 - Using google sheets to act as a data store
 - Using google apps scripts to provide the glue

### Setup and Installation

To setup and deply a new version of this application in your own G-Suite perform
the following:

```sh
git clone git@github.com:ALRW/three-sixty.git && cd three-sixty
```

```sh
npm install -g @google/clasp && npm install
```

```sh
clasp login
```

```sh
clasp create --type webapp
```

Then update your appsscript.json to the following:

```json
{
  "timeZone": "America/New_York",
  "dependencies": {
  },
  "webapp": {
    "access": "MYSELF",
    "executeAs": "USER_DEPLOYING"
  },
  "exceptionLogging": "STACKDRIVER"
}
```

finally to deploy and view your webapp

```sh
clasp push && clasp deploy
```

Before you can use the application you'll need to give it permission to access
certain google resources. First, in your browser of choice, navigate to:
[Google apps scripts](https://script.google.com) and open the `Three-sixty`
project.

Now click on `Run` > `Run function` > `any functions is fine` in the navigation
bar. This will open a prompt and ask you to give this script the permissions it
requires.

We can now access our running app by running the following in the command line:

```sh
clasp open --webapp
```
