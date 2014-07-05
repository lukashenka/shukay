<?php
/**
 * Created by PhpStorm.
 * User: karachungen
 * Date: 7/5/14
 * Time: 10:56 PM
 */

namespace Shukay\MapBundle\Form;
use FOS\UserBundle\Form\Type\ProfileFormType as BaseType;
use Symfony\Component\Form\FormBuilderInterface;

class ChangeEmailFormType extends BaseType{

    protected function buildUserForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('email', 'email', array('label' => 'form.email', 'translation_domain' => 'FOSUserBundle'))
        ;
    }

    public function getName()
    {
        return 'change_email';
    }

} 