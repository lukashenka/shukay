<?php

namespace Shukay\MapBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class LocationType extends AbstractType
{
	/**
	 * @param FormBuilderInterface $builder
	 * @param array $options
	 */
	public function buildForm(FormBuilderInterface $builder, array $options)
	{
		$builder
            ->add('latitude', 'hidden', array("attr" => array("id" => "form_latitude")))
            ->add('longitude', 'hidden', array("attr" => array("id" => "form_longitude")));
    }

	/**
	 * @param OptionsResolverInterface $resolver
	 */
	public function setDefaultOptions(OptionsResolverInterface $resolver)
	{
		$resolver->setDefaults(array(
			'data_class' => 'Shukay\MapBundle\Entity\Location'
		));
	}

	/**
	 * @return string
	 */
	public function getName()
	{
        return 'location';
    }
}
