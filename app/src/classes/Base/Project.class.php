<?php

/***************************************************************************
 *   Проект                                                                *
 *   @author Schon Dewid  2015                                             *
 ***************************************************************************/
class Project extends ProjectBase
{
    public static function getBaseUrl()
    {
        try {
            return ProjectConfig::create()
                ->setConfig('project')
                ->getItemConfig('base_url');
        } catch (Exception $e) {
            return null;
        }
    }
}