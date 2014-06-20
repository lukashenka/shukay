<?php
/**
 * Created by PhpStorm.
 * User: karachungen
 * Date: 6/20/14
 * Time: 3:09 PM
 */

namespace Shukay\AdminBundle\Admin;


use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;

class MenuAdmin extends Admin
{
	protected function configureFormFields(FormMapper $formMapper)
	{
		$formMapper
			->add('title', null, array())
			->add('route', null, array())
			->add('alias', null, array())
			->add('static', null, array('required' => false))
			->add('parent', null, array('required' => false))
			->add('children', null, array('required' => false))
			->add('menuTypeId', 'sonata_type_model', array(
					'class' => 'Shukay\MenuBundle\Entity\MenuType',
					'property' => 'title',
					'required' => false
				)
			);
	}

	protected function configureDatagridFilters(DatagridMapper $datagridMapper)
	{
		$datagridMapper
			->add('title', null, array())
			->add('id', null, array())
			->add('route', null, array());
	}

	public function configureShowField(ShowMapper $showMapper)
	{
		$showMapper
			->add('title', null, array())
			->add('id', null, array())
			->add('route', null, array());
	}

	protected function configureListFields(ListMapper $listMapper)
	{
		$listMapper
			->addIdentifier('title', null, array())
			->add('route', null, array())
			->add('id', null, array())
			->add('menuTypeId', 'entity', array(
					'class' => 'MenuBundle:MenuType',
					'property' => 'title'
				)
			);
	}
}