class QueryBuilder {
  constructor(model, query) {
    this.model = model;
    this.filters = query.filters || null;
    this.page = query.page || null;
    this.sort = query.sort ? query.split(",") : null;
    this.relatedCollections = model.getRelatedColletions() || [];
    this.aggregateQuery = [];
  }

  resetAggregateQuery = () => {
    this.aggregateQuery = [];
  };

  buildLookUpStage = () => {
    this.relatedCollections.forEach(mainPath => {
      this.aggregateQuery.push({
        $lookup: {
          from: mainPath.path === "creators" ? "users" : mainPath.path,
          localField: mainPath.path,
          foreignField: "_id",
          as: mainPath.path,
        },
      });
    });
  };

  buildMatchStage = () => {
    const getFilteringElement = filter => {
      const element = {};
      const aux = filter.split("(");
      const operator = aux[0];
      let values = aux[1].substring(0, aux[1].length - 1);

      const operatorsValue = ["eq", "gt", "gte", "lt", "lte", "ne"];
      const operatorsArray = ["in", "nin"];

      if (operatorsArray.includes(operator)) {
        element[`$${operator}`] = values.split(",");
      } else if (operatorsValue.includes(operator)) {
        if (Number(values) !== "NaN") {
          values = Number(values);
        } else if (values === "true") {
          values = values === "true";
        } else if (values === "false") {
          values = values === "false";
        } else {
          values = values;
        }
        element[`$${operator}`] = values;
      } else if (operator === "contain") {
        element[`$regex`] = values;
        element[`$options`] = "i";
      }
      return element;
    };

    if (!this.filters) {
      this.matchStage = null;
      return;
    }

    this.matchStage = { $match: { $and: [] } };

    for (const fieldName in this.filters) {
      if (Array.isArray(this.filters[fieldName])) {
        for (const index in this.filters[fieldName]) {
          this.matchStage["$match"]["$and"].push({
            [fieldName]: getFilteringElement(this.filters[fieldName][index]),
          });
        }
      } else {
        this.matchStage["$match"]["$and"].push({
          [fieldName]: getFilteringElement(this.filters[fieldName]),
        });
      }
    }

    this.aggregateQuery.push(this.matchStage);
  };

  buildSortStage = () => {
    if (!this.sort || !Array.isArray(this.sort)) {
      this.sortStage = null;
      return;
    }

    this.sortStage = { $sort: {} };

    this.sort.forEach(path => {
      let order = 1;
      let fieldToSort = path;

      if (path.charAt(0) === "-") {
        order = -1;
        fieldToSort = path.substring(1, path.length);
      }
      this.sortStage["$sort"][fieldToSort] = order;
    });

    this.sortStage["$sort"]["_id"] = 1;
    this.aggregateQuery.push(this.sortStage);
  };

  buildSkipStage = () => {
    if (!this.page || !this.page.number || !this.page.size) {
      this.skipStage = null;
      return;
    }

    this.skipStage = { $skip: {} };
    this.skipStage["$skip"] = (this.page.number - 1) * this.page.size;
    this.aggregateQuery.push(this.skipStage);
  };

  buildLimitStage = () => {
    if (!this.page || !this.page.number || !this.page.size) {
      this.limitStage = null;
      return;
    }
    this.limitStage = { $limit: {} };
    this.limitStage["$limit"] = parseInt(this.page.size);
    this.aggregateQuery.push(this.limitStage);
  };

  buildCountStage = () => {
    this.countStage = { $count: "count" };
    this.aggregateQuery.push(this.countStage);
  };

  insertMatchStageToQuery(matchObject) {}

  getDocumentsCount = async matchStageAdditional => {
    if (matchStageAdditional) {
      const matchStage = { $match: matchStageAdditional };
      this.aggregateQuery.push(matchStage);
    }

    this.buildLookUpStage();
    this.buildMatchStage();
    this.buildCountStage();
    const [countDocuments] = await this.model.aggregate(this.aggregateQuery);

    this.resetAggregateQuery();

    return countDocuments ? countDocuments.count : 0;
  };

  getDocuments = async matchStageAdditional => {
    if (matchStageAdditional) {
      const matchStage = { $match: matchStageAdditional };
      this.aggregateQuery.push(matchStage);
    }

    this.buildLookUpStage();
    this.buildMatchStage();
    this.buildSortStage();
    this.buildSkipStage();
    this.buildLimitStage();

    const documents = await this.model.aggregate(this.aggregateQuery);

    return documents;
  };

  getCollections = async (matchStageAdditional = null) => {
    const countDocuments = await this.getDocumentsCount(matchStageAdditional);
    const documents = await this.getDocuments(matchStageAdditional);

    return {
      countDocuments,
      documents,
    };
  };
}

module.exports = QueryBuilder;
