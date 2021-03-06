// client.js - node-zendesk client initialization
'use strict';

var parts = [
      'Users', 'Tickets', 'TicketAudits', 'TicketFields', 'TicketMetrics',
      'Views', 'Requests', 'UserIdentities', 'Groups', 'GroupMemberships',
      'CustomAgentRoles', 'Organizations', 'Search', 'Tags', 'Forums',
      'ForumSubscriptions', 'Categories', 'Topics', 'TopicComments',
      'TopicSubscriptions', 'TopicVotes', 'AccountSettings',
      'ActivityStream', 'Attachments', 'JobStatuses', 'Locales',
      'Macros', 'SatisfactionRatings', 'SuspendedTickets', 'UserFields',
      'OrganizationFields', 'OauthTokens', 'Triggers'
    ],
    helpcenterParts = [
      'Articles', 'Sections', 'Categories', 'Translations',
      'ArticleComments', 'ArticleLabels', 'ArticleAttachments',
      'Votes', 'Search', 'AccessPolicies'
    ];

exports.createClient = function (options) {
  var nconf = require('nconf'),
      store = new nconf.Provider();
  nconf.use('memory');
  if (true !== options.disableGlobalState) {
    nconf.env().argv({
      's': {
        alias: 'subdomain'
      },
      'u': {
        alias: 'username'
      },
      'p': {
        alias: 'password'
      },
      't': {
        alias: 'token'
      },
      'r': {
        alias: 'remoteUri'
      },
      'hc': {
        alias: 'helpcenter'
      }
    });
  }

  options = store.defaults(options);

  if (nconf.get('helpcenter')) {
    this.helpcenter = true;
  }

  if (nconf.get('subdomain')) {
    if (this.helpcenter) {
      nconf.set('remoteUri', 'https://' + nconf.get('subdomain') + '.zendesk.com/hc/api/v2');
    } else {
      nconf.set('remoteUri', 'https://' + nconf.get('subdomain') + '.zendesk.com/api/v2');
    }
  }

  var client = {}, partsToAdd, clientPath;

  if (this.helpcenter) {
    partsToAdd = helpcenterParts;
    clientPath = './client/helpcenter/';
  } else {
    partsToAdd = parts;
    clientPath = './client/';
  }

  partsToAdd.forEach(function (k) {
    exports[k] = require(clientPath + k.toLowerCase())[k];
  });

  partsToAdd.forEach(function (k) {
    client[k.toLowerCase()] = new exports[k](options);
    client[k.toLowerCase()].on('debug::request',  debug);
    client[k.toLowerCase()].on('debug::response', debug);
  });

  function debug(args) {
    if (options.get('debug')) {
      console.log(args);
    }
  }
  return client;
};
