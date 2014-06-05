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

class StuffAdmin extends Admin
{

	// Fields to be shown on create/edit forms
	protected function configureFormFields(FormMapper $formMapper)
	{
		$formMapper


			->add('name') //if no type is specified, SonataAdminBundle tries to guess it
			->add('description') //if no type is specified, SonataAdminBundle tries to guess it
			->add('file', 'file', array('required' => false))
			->add('owner', 'entity', array('class' => 'Shukay\UserBundle\Entity\User'));
	}

	// Fields to be shown on filter forms
	protected function configureDatagridFilters(DatagridMapper $datagridMapper)
	{
		$datagridMapper
			->add('picture')
			->add('name');
	}

	// Fields to be shown on lists
	protected function configureListFields(ListMapper $listMapper)
	{
		$listMapper
			->addIdentifier('name')
			->add('description') //if no type is specified, SonataAdminBundle tries to guess it
			->add('picture')
			->add('owner', 'entity', array('class' => 'Shukay\UserBundle\Entity\User'));
	}


	public function prePersist($image)
	{
		$this->manageFileUpload($image);
	}

	public function preUpdate($image)
	{
		$this->manageFileUpload($image);
	}

	private function manageFileUpload($image)
	{
		if ($image->getFile()) {

		}
	}

} 