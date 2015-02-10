<?php

/***************************************************************************
 *   Project Base                                              *
 *   @author Schon Dewid  2015                                             *
 ***************************************************************************/
abstract class ProjectBase
{
    public static function create()
    {
        return new static();
    }
}