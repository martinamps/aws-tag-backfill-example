## AWS Tag Backfill Example

Sample scripts from a recent Datadog webinar. 


## Instructions


1. install the dependencies

```
npm i package.json
```

2. Ensure that you have a credential provider available, see [official docs](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html). 

3. run `node getEC2Tags.js` -- you'll see it writes out a csv and a json file. You should keep iterating as best you can on fuzzy logic to fill missing values for team (or other tags you care about).

4. Once happy, run `node setEC2Tags.js` to upload your new tags back into AWS

5. Feel free to open an issue or [ping me on Twitter](https://twitter.com/martinamps).
