var express = require('express');
var router = express.Router();
var auth = require('../../helpers/auth');
var Promise = require('bluebird');
var Publication = require('../../data/entities/publication');
var PublicationType = require('../../data/properties/publication-type');
var Entity = require('../../data/entity');
var renderRelationship = require('../../helpers/render');

var NotFoundError = require('../../helpers/error').NotFoundError;

/* Middleware loader functions. */
var loadLanguages = require('../../helpers/middleware').loadLanguages;

router.param('bbid', function(req, res, next, bbid) {
	if (/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(bbid)) {
		Publication.findOne(req.params.bbid, {
				populate: [
					'annotation',
					'disambiguation',
					'relationships',
				]
			})
			.then(function(publication) {
				res.locals.entity = publication;

				next();
			})
			.catch(function(err) {
				if (err.status == 404) {
					var newErr = new NotFoundError('Publication not found');
					return next(newErr);
				}

				next(err);
			});
	}
	else {
		next('route');
	}
});

router.get('/:bbid', function(req, res, next) {
	var publication = res.locals.entity;

	var rendered = publication.relationships.map(function(relationship) {
		relationship.entities.sort(function sortRelationshipEntity(a, b) {
			return a.position - b.position;
		});

		relationship.entities = relationship.entities.map(function(entity) {
			return Entity.findOne(entity.entity.entity_gid);
		});

		relationship.template = relationship.relationship_type.template;
		relationship.rendered = Promise.all(relationship.entities)
			.then(function(entities) {
				entities.forEach(function(entity) {
					entity.entity_gid = entity.bbid;
				});
				return renderRelationship(entities, relationship, null);
			});

		return Promise.props(relationship);
	});

	Promise.all(rendered)
		.then(function(rendered) {
			var title = 'Publication';

			if (publication.default_alias && publication.default_alias.name)
				title = 'Publication “' + publication.default_alias.name + '”';

			publication.relationships = rendered;
			res.render('entity/view/publication', {
				title: title
			});
		});
});

// Creation

router.get('/create', auth.isAuthenticated, loadLanguages, function(req, res) {
	// Get the list of publication types
	PublicationType.find()
		.then(function(publicationTypes) {
			res.render('entity/create/publication', {
				publicationTypes: publicationTypes,
				title: 'Add Publication'
			});
		});
});

router.post('/create/handler', auth.isAuthenticated, function(req, res) {
	var changes = {
		bbid: null,
		publication_type: {
			publication_type_id: req.body.publicationTypeId
		}
	};

	if (req.body.disambiguation)
		changes.disambiguation = req.body.disambiguation;

	if (req.body.annotation)
		changes.annotation = req.body.annotation;

	if (req.body.aliases.length) {
		var default_alias = req.body.aliases[0];

		changes.aliases = [{
			name: default_alias.name,
			sort_name: default_alias.sortName,
			language_id: default_alias.languageId,
			primary: default_alias.primary,
			default: true
		}];
	}

	Publication.create(changes, {
			session: req.session
		})
		.then(function(revision) {
			res.send(revision);
		});
});

module.exports = router;
