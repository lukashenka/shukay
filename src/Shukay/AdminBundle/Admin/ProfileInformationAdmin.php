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


class ProfileInformationAdmin extends Admin
{

    // Fields to be shown on create/edit forms
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper

            ->add('user')
            ->add('avatar')
            ->add('firstName')
            ->add('lastName')
            ->add('rate')
            ->add('description')
            ->add('contacts')
            ->add('about');
    }

    // Fields to be shown on filter forms
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('user')
            ->add('avatar')
            ->add('firstName')
            ->add('lastName')
            ->add('rate')
            ->add('description')
            ->add('contacts')
            ->add('about');

    }

    // Fields to be shown on lists
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->addIdentifier('id')
            ->add('user')
            ->add('avatar')
            ->add('firstName')
            ->add('lastName')
            ->add('rate')
            ->add('description')
            ->add('contacts')
            ->add('about');
    }


}