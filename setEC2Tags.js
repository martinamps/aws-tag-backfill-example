import { EC2Client, CreateTagsCommand} from "@aws-sdk/client-ec2"
import { readFileSync } from 'fs'
import { RateLimiter } from "limiter";

const limiter = new RateLimiter({ tokensPerInterval: 3, interval: "second" });

(async () => {
    const ec2Client = new EC2Client();
    let instances = readFileSync('ec2.csv', 'utf8').split("\n");
    instances.shift();
    for (const instance of instances) {
        const [id, state, type, name, launched, asg, team, env] = instance.split(',');
        const params = {
            // Could be smarter to group by team/env here
            Resources: [id],
            Tags: [
                {"Key": 'team', "Value": team.trim()},
                {"Key": 'env', "Value": env.trim()}
            ],
        };
        const command = new CreateTagsCommand(params);
        const remainingRequests = await limiter.removeTokens(1);
        let data = null;
        try {
            data = await ec2Client.send(command);
        } catch (e) {
            console.error("failed", e);
        }
        console.log(id, name, team, env, data);
    }
})();
