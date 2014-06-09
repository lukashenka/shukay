<?php
/**
 * Created by PhpStorm.
 * User: karachungen
 * Date: 6/5/14
 * Time: 4:29 PM
 */

namespace Shukay\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Oh\GoogleMapFormTypeBundle\Form\Type\GoogleMapType;


class LocationAdmin extends Admin
{

	// Fields to be shown on create/edit forms
	protected function configureFormFields(FormMapper $formMapper)
	{
		$formMapper

			->add('latlng', 'sonata_type_immutable_array', array('label' => 'Карта',
				'keys' => array(
					array('latlng', new GoogleMapType(), array())
				)))
			->add('latitude') //if no type is specified, SonataAdminBundle tries to guess it
			->add('longitude') //if no type is specified, SonataAdminBundle tries to guess it
		;
	}

	// Fields to be shown on filter forms
	protected function configureDatagridFilters(DatagridMapper $datagridMapper)
	{
		$datagridMapper
			->add('latitude')
			->add('longitude');
	}

	// Fields to be shown on lists
	protected function configureListFields(ListMapper $listMapper)
	{
		$listMapper
			->addIdentifier('id')
			->add('latitude') //if no type is specified, SonataAdminBundle tries to guess it
			->add('longitude');
	}


}