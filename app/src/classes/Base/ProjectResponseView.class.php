<?php
/***************************************************************************
 *   Респонс для вьюх                                                      *
 *   @author Schon Dewid  2015                                             *
 ***************************************************************************/
class ProjectResponseView extends ProjectBase
{
    /**
     * @var boolean
     */
    protected $success = true;

    /**
     * @var array
     */
    protected $error = array();

    /**
     * @var array
     */
    protected $data = array();


    /** @var  string */
    protected $operation;

    /**
     * @var array
     */
    protected $message = array();

    /**
     * @var null
     */
    protected $tpl = null;

    /**
     * Установка данных 'название параметра' => 'содержимое параметра'
     *
     * @param $k
     * @param $v
     * @return $this
     */
    public function setData($k, $v)
    {
        $this->data[$k] = $v;
        return $this;
    }

    /**
     * Установка данных массивом array ('k1' => 'v1', 'k2' => 'v2')
     *
     * @param array $array
     * @return $this
     */
    public function setDataArray(array $array)
    {
        foreach ($array as $k => $v)
        {
            $this->data[$k] = $v;
        }
        return $this;
    }

    /**
     * @return array
     */
    public function getData()
    {
        return $this->data;
    }

    /**
     * @param $key
     * @param $value
     * @return $this
     */
    public function setError($key, $value)
    {
        if ($this->getSuccess())
            $this->setSuccess(false);
        $this->error[$key] = $value;
        return $this;
    }

    /**
     * @return array
     */
    public function getError()
    {
        return $this->error;
    }

    /**
     * Установка операции
     *
     * @param $operationName
     * @return $this
     */
    public function setOperation($operationName)
    {
        $this->operation = $operationName;
        return $this;
    }

    /**
     * Получение операции
     *
     * @return string
     */
    public function getOperation()
    {
        return $this->operation;
    }


    /**
     * @param $key
     * @param $value
     * @return $this
     */
    public function setMessage($key, $value)
    {
        $this->message[$key] = $value;
        return $this;
    }

    /**
     * @return array
     */
    public function getMessage()
    {
        return $this->message;
    }

    /**
     * @param boolean $success
     * @return $this
     */
    public function setSuccess($success)
    {
        $this->success = $success;
        return $this;
    }

    /**
     * @return boolean
     */
    public function getSuccess()
    {
        return $this->success;
    }

    /**
     * @param $tpl
     * @return $this
     */
    public function setTpl($tpl)
    {
        $this->tpl = $tpl;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getTpl()
    {
        return $this->tpl;
    }
}