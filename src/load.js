const sleep = ms => new Promise(res => setTimeout(res, ms));

const requestBase = require("request-promise").defaults({ jar: true });
const request = async (url, times=0) => {
	if (times === 10) {
		console.log("max retries reached, aborting");
		process.exit(1);
		return;
	}

	try {
		return await requestBase(url);
	} catch (e) {
		await sleep(1000 * 5);
		console.error(e);
		console.log("retrying");
		return request(url, times + 1);
	}
}
const parse = require("xml2js").parseStringPromise;
const path = require("path");

const {addRound, dropRound, countRounds} = require(__dirname + "/db");


const batchSize = 100;

const tasks = [];
	
const createRound = roundName => tasks.push({ typ: "round", name: roundName });
const createCase = caseName => tasks.push({ typ: "case", name: caseName });
const createSearch = idx => tasks.push({ typ: "search", idx, batchSize });

const workerLoop = async () => {
  const processRound = async roundName => {
    const html = await request(`${roundName}`);
		const res = await parse(html);
		
		const objData = Object.create(null);
		res.object.property.forEach(property => objData[property["$"].name] = property.value);
		
		const {space, pageName, wiki} = res.object;
		const args = [ new Date(objData["EntryDate"][0]).getTime(), wiki[0], space[0], pageName[0], objData["RoundReport"][0], objData["OpenSource"][0] ]
			
		await dropRound(...args);
		await addRound(...args.concat(objData["Tournament"][0]));
  }

  const processCase = async caseName => {
    const html = await request(`${caseName}/objects/Caselist.RoundClass?number=100`);
		const res = await parse(html);

    res.objects.objectSummary.forEach(round => createRound(round.link[0]["$"].href));
  }

	const processSearch = async (idx, batchSize) => {
		console.log("HERE");
    const html = await request(`https://openev.debatecoaches.org/rest/wikis/query?q=object:Caselist.RoundClass%20AND%20attdate:[NOW/DAY-180DAYS%20TO%20NOW/DAY]&number=${batchSize}&type=solr&start=${idx}`);

		console.log(`row count: ${(await countRounds())[0].count}`);

		const res = parse(html)

		if (res.searchResults.searchResult) {
      res.searchResults.searchResult.forEach(res => createCase(res.link[0]["$"].href));
		}

		return !!res.searchResults.searchResult
	}

	const processTask = async task => {
		console.log("processing " + task.typ);
		switch (task.typ) {
			case "round": 
				await processRound(task.name);
				break;
			case "case":
				await processCase(task.name);
				break;
			case "search":
				const foundMore = await processSearch(task.idx, task.batchSize);
				if (foundMore) createSearch(task.idx + task.batchSize);
				break;
		}
	}

	while (true) {
		if (tasks.length !== 0) {
			await processTask(tasks[tasks.length - 1]);
			tasks.pop();
		} else await sleep(1000 * 1);
	}
}

module.exports = {
	start: workerLoop,
	update: () => {
		if (tasks.length === 0) {
			createSearch(0);
			return true;
		}
		return false;
	}
}

