<?php

namespace Shukay\StuffBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use Shukay\MapBundle\Form\LocationType;

class StuffType extends AbstractType

{
        /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('picture')
            ->add('name')
            ->add('description')
            ->add('location',new LocationType())
        ;
    }
    
    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'Shukay\StuffBundle\Entity\Stuff'
        ));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'shukay_stuffbundle_stuff';
    }
}
