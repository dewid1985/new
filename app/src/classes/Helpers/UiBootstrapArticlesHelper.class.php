<?php
/***************************************************************************
 *   Эта штука возможно вообще в последующем не подандобится               *
 *   да и нужно выгребсти это обязательно                                  *
 *   @author Schon Dewid  2015                                             *
 ***************************************************************************/
class UiBootstrapArticlesHelper extends Singleton
{
    protected $action;

    /**
     * @param mixed $action
     */
    public function setAction($action)
    {
        $this->action = $action;
    }

    /**
     * @return mixed
     */
    public function getAction()
    {
        return $this->action;
    }


    /**
     * @return UiBootstrapArticlesHelper
     */
    public static function me()
    {
        return Singleton::getInstance(__CLASS__);
    }

    public function value($value)
    {
        echo<<<EOT
value="$value"
EOT;
    }

    public function insertText($text)
    {
        echo<<<EOT
$text
EOT;
    }

    public function alertWarning ($message)
    {
        echo<<<EOT
<div class="alert alert-warning alert-dismissible fade in" role="alert">
<button class="close" aria-label="Close" data-dismiss="alert" type="button">
<span aria-hidden="true">×</span>
</button>
<strong>Ошибка</strong>
$message
</div>
EOT;
    }

    public function rubrics(array $array)
    {
        $str ='';
        for ($i = 1; $i <= 3; $i++) {
           if(array_key_exists('rubric_'.$i, $array))
                $str.='<button id="'.$array['rubric_'.$i].'" class="btn btn-success btn-xs" onclick="deleteArticleRubric('.
                    $array['rubric_'.$i].')"'.'style="margin-right: 3px" type="button">'.
                  PlatformCommonRubric::dao()->getByName($array['rubric_'.$i])->getRubricData()->getShortName().' ×</button>'.
                    '<input id="rubric_'.$array['rubric_'.$i].'" hidden="" name="rubric_'.$i.
                    '" value="'.$array['rubric_'.$i].'">';
        }
        echo($str);
    }

    public function getUrl()
    {
        echo(Project::getBaseUrl().'articles/'.$this->getAction());
    }

    public function getNameButton($operation)
    {
        switch ($operation) {
            case 'add':
                echo('Cохранить');
                break;
            case 'save':
                echo('Обновить');
                break;
        }
    }

    public function getTitle($data)
    {
        if(array_key_exists('titlePage', $data))
            echo($data['titlePage']);
    }
}


