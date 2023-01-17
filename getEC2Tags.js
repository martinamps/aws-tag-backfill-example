import { EC2Client, paginateDescribeInstances } from "@aws-sdk/client-ec2"
import { writeFileSync } from 'fs'

(async () => {
    const ec2Client = new EC2Client();

    const instances = [];
    for await (const page of paginateDescribeInstances({ client: ec2Client }, {})) {
        for (const res of page.Reservations) {
            instances.push(...res.Instances);
        }
    }

    const outputCSV = [];
    for (const instance of instances) {
        console.log(instance);
        console.log(instance.Tags);
        let env = '';
        let name = '';
        let asg = '';
        let team = '';

        if (instance.Tags) {
            // Tweak these as you see fit
            let nameTag = instance.Tags.find(o => o.Key == 'Name' || o.Key == 'applicationName');
            let asgTag = instance.Tags.find(o => o.Key == 'aws:autoscaling:groupName');
            if (asgTag) {
                asg = asgTag.Value;
            }
            if (nameTag) {
                name = nameTag.Value;
            }
            let teamTag = instance.Tags.find(o => o.Key == 'used_by_team' || o.Key == 'team' || o.Key == 'ownerID');
            if (teamTag) {
                team = teamTag.Value.replace(':team:', '');
            } else {
                const resolvedTeam = await getTeam(name);
                if (resolvedTeam && resolvedTeam.length) {
                    team = resolvedTeam;
                } else if (name || asg) {
                    const computeKeywords = ['kafka', 'on-ramp', 'zookeeper'];
                    for (const keywrd of computeKeywords) {
                        if (name.indexOf(keywrd) !== -1 || asg.indexOf(keywrd) !== -1) {
                            team = 'compute_infrastructure';
                        }
                    }

                    // More fuzzy matching here

                }

                let envTag = instance.Tags.find(o => o.Key == 'algo-environment' || o.Key == 'env' || o.Key == 'environment');
                if (envTag) {
                    env = envTag.Value;
                } else if (/staging|prod/.test(name)) {
                    env = name.indexOf('prod') !== -1 ? 'prod' : 'staging'
                } else if (/staging|prod/.test(asg)) {
                    env = asg.indexOf('prod') !== -1 ? 'prod' : 'staging'
                }
            }

            // Write to our CSV
            outputCSV.push({
                id: instance.InstanceId,
                state: instance.State.Name,
                type: instance.InstanceType,
                name,
                launched: instance.LaunchTime,
                asg,
                team,
                env
            });
        }
    }

    writeFileSync('ec2.json', JSON.stringify(instances));
    writeFileSync('ec2.csv', convertToCSV(outputCSV));
})();


function convertToCSV(arr) {
    const array = [Object.keys(arr[0])].concat(arr)

    return array.map(it => {
        return Object.values(it).toString()
    }).join('\n')
}

async function getTeam(service) {
    let team = '';

    // Lookup via REST API, JSON File, static map, etc.

    return team;
}
