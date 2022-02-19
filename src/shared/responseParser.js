const { globalConfig } = require("../config");
const ResponsesTypes = require("./responseTypes");

class ResponseParser {
  constructor({ model, documents, request, totalDocuments }) {
    this.model = model || null;
    this.documents = documents || null;
    this.totalDocuments = totalDocuments || null;
    this.fieldsToSelect = model ? model.getFieldsToSelect() : null;
    this.relatedCollections = model ? model.getRelatedColletions() : null;
    this.entityName = model ? model.getEntity() : null;
    this.request = request || null;
    this.query = (request && request.query) || {};
    this.response = {};
    this.includedPath = [];
  }

  set query({ page, include, fields }) {
    this.pageNumber = page && page.number ? page.number : null;
    this.pageSize = page && page.size ? page.size : null;
    this.includeQuery = include ? include.split(",") : null;
    this.fieldsQuery = fields ? fields : null;

    if (this.fieldsQuery && this.fieldsQuery[this.entityName]) {
      this.fieldsToSelect = this.fieldsQuery[this.entityName].split(",");
    }
  }

  getSelectedAttributes = document => {
    const attributes = {};

    for (const key in document) {
      if (this.fieldsToSelect.includes(key)) {
        attributes[key] = document[key];
      }
    }
    return attributes;
  };

  getRelationship = document => {
    const generateRelatedData = (document, path) => {
      const typeInstance = this.model.schema.paths[path.path].instance;

      const generateInclude = (document, path) => {
        const checkIfObjectIncluded = (type, id) => {
          let isIncluded = false;

          this.includedPath.forEach(object => {
            if (
              object.id.toString() === id.toString() &&
              object.type === type
            ) {
              isIncluded = true;
            }
          });

          return isIncluded;
        };

        const getFields = (document, fields) => {
          const attributes = {};

          fields.forEach(field => {
            attributes[field] = document[field];
          });

          return attributes;
        };

        let pathFields = path.fields;

        if (this.fieldsQuery && this.fieldsQuery[path.path]) {
          pathFields = this.fieldsQuery[path.path].split(",");
        }
        let documentCopy;
        if (!Array.isArray(document[path.path])) {
          documentCopy = [document[path.path]];
        } else {
          documentCopy = document[path.path];
        }

        documentCopy.forEach(object => {
          if (!checkIfObjectIncluded(path.path, object._id)) {
            this.includedPath.push({
              type: path.path,
              id: object._id,
              attributes: getFields(object, pathFields),
              links: {
                self: `${globalConfig.api_url_base}/${path.path}/${object._id}`,
              },
            });
          }
        });
      };

      if (this.includeQuery && this.includeQuery.includes(path.path)) {
        generateInclude(document, path);
      }

      if (typeInstance === "Array") {
        const dataResult = [];

        document[path.path].forEach(element => {
          dataResult.push({
            type: path.path,
            id: element._id.toString(),
          });
        });

        return dataResult;
      }

      if (document[path.path]) {
        if (
          typeInstance === "ObjectID" &&
          Array.isArray(document[path.path]) &&
          document[path.path].length > 0
        ) {
          return {
            type: path.path,
            id: document[path.path][0]._id.toString(),
          };
        } else if (
          typeInstance === "ObjectID" &&
          !Array.isArray(document[path.path])
        ) {
          return {
            type: path.path,
            id: document[path.path]._id.toString(),
          };
        }
      }
    };

    const relationshipObject = {};

    this.relatedCollections.forEach(async path => {
      relationshipObject[path.path] = {
        links: {
          self: `${globalConfig.api_url_base}/${this.entityName}/${document._id}/relationships/${path.path}`,
          related: `${globalConfig.api_url_base}/${this.entityName}/${document._id}/${path.path}`,
        },
        data: generateRelatedData(document, path),
      };
    });

    return relationshipObject;
  };

  parseDataCollection() {
    const getOriginalUrlFiltered = () => {
      const originalUrl = this.request.originalUrl;
      const [urlBase, urlQuery] = originalUrl.split("?");
      const urlQueryFiltered = urlQuery
        .split("&")
        .filter(query => {
          return !/page/.test(query);
        })
        .join("&");

      const result =
        urlQueryFiltered.length > 0
          ? `${globalConfig.server_url_base}${urlBase}?${urlQueryFiltered}&`
          : `${globalConfig.server_url_base}${urlBase}?${urlQueryFiltered}`;

      return result;
    };

    const getLinks = () => {
      const urlTest = `${globalConfig.server_url_base}${this.request.originalUrl}`;

      if (!this.pageSize && !this.pageNumber) {
        return {
          self: `${globalConfig.server_url_base}${this.request.originalUrl}`,
        };
      }

      const originalUrlFiltered = getOriginalUrlFiltered();

      const links = {};
      const totalPages = Math.ceil(this.totalDocuments / this.pageSize);
      let currentPage = parseInt(this.pageNumber);

      if (currentPage < 1) {
        currentPage = 1;
      } else if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
      }

      const firstPage = 1;
      const prevPage = currentPage - 1;
      const nextPage = currentPage + 1;

      if (currentPage === 2 && totalPages !== 0) {
        links.prev = `${originalUrlFiltered}page%5Bnumber%5D=${prevPage}&page%5Bsize%5D=${this.pageSize}`;
      } else if (currentPage >= 3 && totalPages !== 0) {
        links.first = `${originalUrlFiltered}page%5Bnumber%5D=${firstPage}&page%5Bsize%5D=${this.pageSize}`;
        links.prev = `${originalUrlFiltered}page%5Bnumber%5D=${prevPage}&page%5Bsize%5D=${this.pageSize}`;
      }

      links.self = `${originalUrlFiltered}page%5Bnumber%5D=${currentPage}&page%5Bsize%5D=${this.pageSize}`;

      if (currentPage <= totalPages - 2) {
        links.next = `${originalUrlFiltered}page%5Bnumber%5D=${nextPage}&page%5Bsize%5D=${this.pageSize}`;
        links.last = `${originalUrlFiltered}page%5Bnumber%5D=${totalPages}&page%5Bsize%5D=${this.pageSize}`;
      } else if (currentPage <= totalPages - 1) {
        links.next = `${originalUrlFiltered}page%5Bnumber%5D=${nextPage}&page%5Bsize%5D=${this.pageSize}`;
      }

      return links;
    };

    this.response = {
      links: getLinks(),
      api: {
        items_total: this.totalDocuments ?? 0,
      },
      data: [],
    };

    this.documents.forEach(async document => {
      this.response.data.push({
        type: this.entityName,
        id: document._id,
        attributes: this.getSelectedAttributes(document),
        relationships: this.getRelationship(document),
        links: {
          self: `${globalConfig.api_url_base}/${this.entityName}/${document._id}`,
        },
      });
    });
    if (this.includeQuery) {
      this.response["included"] =
        this.includedPath.length > 0 ? this.includedPath : [];
    }
  }

  parseDataIndividual() {
    this.response = {
      links: {
        self: `${globalConfig.api_url_base}/${this.entityName}/${this.documents._id}`,
      },
      data: {
        type: this.entityName,
        id: this.documents._id,
        attributes: this.getSelectedAttributes(this.documents),
        relationships: this.getRelationship(this.documents),
      },
    };

    if (this.includeQuery) {
      this.response["included"] =
        this.includedPath.length > 0 ? this.includedPath : [];
    }
  }

  sendResponseCreateSuccess(res) {
    return res
      .status(
        ResponsesTypes.success.success_200.success_resource_created_success
          .httpStatusCode
      )
      .json(this.response);
  }

  sendResponseGetSuccess(res) {
    return res
      .status(
        ResponsesTypes.success.success_200.success_resource_get_success
          .httpStatusCode
      )
      .json(this.response);
  }

  sendResponseUpdateSuccess(res) {
    return res
      .status(
        ResponsesTypes.success.success_200.success_resource_updated_success
          .httpStatusCode
      )
      .json(this.response);
  }

  sendResponseDeleteSuccess(res) {
    return res
      .status(
        ResponsesTypes.success.success_200.success_resource_deleted_success
          .httpStatusCode
      )
      .json();
  }

  sendResponseResetPasswordSuccess(res) {
    return res
      .status(
        ResponsesTypes.success.success_200.success_reset_password_success
          .httpStatusCode
      )
      .json();
  }

  sendResponseUserRegisterSuccess(res) {
    return res
      .status(
        ResponsesTypes.success.success_200.success_reset_password_success
          .httpStatusCode
      )
      .json();
  }
}

module.exports = ResponseParser;
