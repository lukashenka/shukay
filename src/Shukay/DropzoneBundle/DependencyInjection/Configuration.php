<?php

namespace Shukay\DropzoneBundle\DependencyInjection;

use Symfony\Component\Config\Definition\Builder\TreeBuilder;
use Symfony\Component\Config\Definition\ConfigurationInterface;

/**
 * This is the class that validates and merges configuration from your app/config files
 *
 * To learn more see {@link http://symfony.com/doc/current/cookbook/bundles/extension.html#cookbook-bundles-extension-config-class}
 */
class Configuration implements ConfigurationInterface
{
	/**
	 * {@inheritDoc}
	 */
	public function getConfigTreeBuilder()
	{
		$treeBuilder = new TreeBuilder();
		$rootNode = $treeBuilder->root('shukay_dropzone');

		$rootNode
			->children()
			->arrayNode('types')
			->useAttributeAsKey('id')
			->isRequired()
			->requiresAtLeastOneElement()
			->prototype('array')
			->children()
			->enumNode('frontend')
			->values(array('fineuploader', 'blueimp', 'uploadify', 'yui3', 'fancyupload', 'mooupload', 'plupload', 'dropzone', 'custom'))
			->isRequired()
			->end()
			->arrayNode('custom_frontend')
			->addDefaultsIfNotSet()
			->children()
			->scalarNode('name')->defaultNull()->end()
			->scalarNode('class')->defaultNull()->end()
			->end()
			->end()
			->end();


		return $treeBuilder;
	}
}
